import { Effect, FileSystem, Option, Path, Stream } from "effect";
import iconv from "iconv-lite";
import { runAuditedFx } from "~/audit-log/fx/runAuditedFx";
import { checkDataPathsFx } from "~/file-boundary/fx/checkDataPathsFx";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SupplierRecordSchema } from "~/accounting-record/schema/SupplierRecordSchema";
import type { InvoiceRecordSchema } from "~/accounting-record/schema/InvoiceRecordSchema";
import { importRecordsFx } from "~/record-import/fx/importRecordsFx";
import { readIntermediateStream } from "~/record-import/stream/readIntermediateStream";
import { projectKaktusInvoiceFx } from "~/record-export/fx/projectKaktusInvoiceFx";
import { printKaktusInvoiceFn } from "~/record-export/fn/printKaktusInvoiceFn";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import type { BatchSummarySchema } from "~/record-validation/schema/BatchSummarySchema";
import { formatBatchSummaryFn } from "~/record-validation/fn/formatBatchSummaryFn";
import type { RecordValidationError } from "~/record-validation/error/RecordValidationError";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";
import { formatCauseFn } from "~/text-output/fn/formatCauseFn";
import { ExportOptionsSchema } from "../schema/ExportOptionsSchema";
import type { ExportSummarySchema } from "../schema/ExportSummarySchema";
import { ExportError } from "../error/ExportError";
import { readExportSnapshotStream } from "../stream/readExportSnapshotStream";
import { indexExportSnapshotFx } from "./indexExportSnapshotFx";

/** Validate the whole input once, join on disk, then publish one complete company batch. */
export const exportKaktusFx = Effect.fn("exportKaktusFx")(function* (
	inputOptions: ExportOptionsSchema.Type,
) {
	const options = yield* parseRecordFx(
		ExportOptionsSchema,
		inputOptions,
		"Kaktus export options",
	);
	const path = yield* Path.Path;
	const fs = yield* FileSystem.FileSystem;
	const log = yield* ProcessingLog;
	const input = path.resolve(options.input);
	const output = path.resolve(options.output);
	yield* checkDataPathsFx(
		[
			input,
		],
		output,
	);
	const operation = "kaktus-export";
	const audited = yield* runAuditedFx(
		{
			actor: options.actor,
			bestEffort: options.bestEffort,
			action: "export_kaktus",
			inputs: [
				input,
			],
			output,
		},
		Effect.scoped(
			Effect.gen(function* () {
				const directory = yield* fs.makeTempDirectoryScoped({
					prefix: "taxy-kaktus-export-",
				});
				const snapshot = path.join(directory, "snapshot.ndjson");
				const scanned = yield* importRecordsFx({
					bestEffort: options.bestEffort,
					records: readIntermediateStream({
						path: input,
						maxRecordBytes: options.maxRecordBytes,
						chunkBytes: 16 * 1024,
					}),
					publication: {
						output: snapshot,
						maxChunkBytes: 1024 * 1024 + 1,
					},
					exportOptions: {
						format: "intermediate",
						maxRecordBytes: 1024 * 1024,
					},
				});
				const selected = yield* indexExportSnapshotFx(snapshot, directory, options);
				yield* log.writeFx({
					operation,
					phase: "started",
					message: `Company ${options.companyId}: ${selected} selected invoices; Windows-1250 XML to ${output}`,
				});
				let accepted = 0;
				let rejected = 0;
				const summaryFn = (): BatchSummarySchema.Type => ({
					bestEffort: options.bestEffort,
					records: accepted,
					rejectedRecords: scanned.rejectedRecords + rejected,
					reviewRequired: scanned.rejectedRecords + rejected > 0,
				});
				const rejectFx = Effect.fnUntraced(function* (
					error: RecordValidationError | ExportError,
					invoice: InvoiceRecordSchema.Type,
				) {
					rejected += 1;
					const prefix = `${invoice.source.location}#${invoice.source.record} invoice ${invoice.data.id}`;
					const messages =
						error._tag === "RecordValidationError"
							? error.issues.map(
									(issue) =>
										`${prefix} field ${issue.path.join(".") || "<root>"}: ${issue.message}`,
								)
							: [
									`${prefix}: ${error.message}`,
								];
					for (const message of messages)
						yield* log
							.writeFx({
								operation,
								phase: "failed",
								message,
							})
							.pipe(Effect.catchTag("ProcessingLogError", () => Effect.fail(error)));
					return null;
				});
				const encodeInvoiceFx = Effect.fnUntraced(function* (
					invoice: InvoiceRecordSchema.Type,
				) {
					const supplierPath = path.join(
						directory,
						`supplier-${invoice.data.supplierId}.ndjson`,
					);
					if (!(yield* fs.exists(supplierPath)))
						return yield* Effect.fail(
							new ExportError({
								detail: `Missing supplier ${invoice.data.supplierId} in company ${options.companyId}.`,
							}),
						);
					const stored = yield* readExportSnapshotStream(supplierPath).pipe(
						Stream.runHead,
					);
					const record = yield* Option.match(stored, {
						onNone: () =>
							Effect.fail(
								new ExportError({
									detail: "Empty supplier snapshot.",
								}),
							),
						onSome: Effect.succeed,
					});
					const supplier = yield* parseRecordFx(
						SupplierRecordSchema,
						record,
						supplierPath,
					);
					const projected = yield* projectKaktusInvoiceFx(invoice, supplier);
					const bytes = iconv.encode(printKaktusInvoiceFn(projected), "windows-1250");
					if (bytes.byteLength > options.maxOutputRecordBytes)
						return yield* Effect.fail(
							new ExportError({
								detail: `XML invoice requires ${bytes.byteLength} bytes; output limit is ${options.maxOutputRecordBytes}.`,
							}),
						);
					accepted += 1;
					return bytes;
				});
				const invoices = readExportSnapshotStream(snapshot).pipe(
					Stream.filter((record) => record.type === TypeEnumSchema.enum.received_invoice),
					Stream.filter(
						(record) =>
							record.data.companyId === options.companyId &&
							(options.invoiceId === null || record.data.id === options.invoiceId),
					),
					Stream.mapEffect(
						(invoice) =>
							encodeInvoiceFx(invoice).pipe(
								Effect.catchTag("RecordValidationError", (error) =>
									rejectFx(error, invoice),
								),
								Effect.catchTag("KaktusExportError", (error) =>
									rejectFx(error, invoice),
								),
							),
						{
							concurrency: 1,
						},
					),
					Stream.filter((bytes) => bytes !== null),
					Stream.onEnd(
						Effect.gen(function* () {
							if (accepted === 0 || (rejected > 0 && !options.bestEffort))
								return yield* Effect.fail(
									new ExportError({
										detail: `${rejected} XML invoices rejected, ${accepted} admitted; no XML published. See ${log.path}.`,
									}),
								);
							yield* log.writeFx({
								operation,
								phase: "progress",
								message: `XML scan complete; ready for publication. ${formatBatchSummaryFn(summaryFn())}`,
							});
						}),
					),
				);
				const header = `<?xml version="1.0" encoding="windows-1250"?>\r\n<KaktusDavka verze="3.2" firma="${options.companyId}">\r\n`;
				const content = Stream.make(iconv.encode(header, "windows-1250")).pipe(
					Stream.concat(invoices),
					Stream.concat(Stream.make(iconv.encode("</KaktusDavka>\r\n", "windows-1250"))),
				);
				const publication = yield* publishFileFx({
					content,
					options: {
						output,
						maxChunkBytes: Math.max(1024, options.maxOutputRecordBytes),
					},
				});
				yield* log
					.writeFx({
						operation,
						phase: "succeeded",
						message: `${publication.path}; ${formatBatchSummaryFn(summaryFn())}`,
					})
					.pipe(Effect.ignore);
				return {
					...summaryFn(),
					companyId: options.companyId,
					publication,
					log: log.path,
				};
			}),
		).pipe(
			Effect.onError((cause) =>
				log
					.writeFx({
						operation,
						phase: "failed",
						message: formatCauseFn(cause),
					})
					.pipe(Effect.ignore),
			),
		),
		formatBatchSummaryFn,
	);
	return {
		...audited.result,
		audit: audited.audit,
	} satisfies ExportSummarySchema.Type;
});
