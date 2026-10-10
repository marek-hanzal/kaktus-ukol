import { Effect, FileSystem, Path, Stream } from "effect";
import { match, P } from "ts-pattern";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { encodeRecordFx } from "~/record-export/fx/encodeRecordFx";
import type { ExportOptionsSchema } from "../schema/ExportOptionsSchema";
import { ExportError } from "../error/ExportError";
import { readExportSnapshotStream } from "../stream/readExportSnapshotStream";

/** Disk-backed supplier and invoice identities keep memory independent of dataset size. */
export const indexExportSnapshotFx = Effect.fn("indexExportSnapshotFx")(function* (
	snapshot: string,
	directory: string,
	options: ExportOptionsSchema.Type,
) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	let companies = 0;
	let invoices = 0;
	const storeFx = Effect.fnUntraced(function* (name: string, bytes: Uint8Array) {
		yield* Effect.scoped(
			Effect.gen(function* () {
				const file = yield* fs
					.open(path.join(directory, name), {
						flag: "wx",
					})
					.pipe(
						Effect.mapError((error) =>
							error.reason._tag === "AlreadyExists"
								? new ExportError({
										detail: `Repeated source identity ${name}; replacement is forbidden.`,
									})
								: error,
						),
					);
				yield* file.writeAll(bytes);
			}),
		);
	});
	yield* readExportSnapshotStream(snapshot).pipe(
		Stream.runForEach((record) =>
			match(record)
				.with(
					{
						type: TypeEnumSchema.enum.company,
					},
					({ data }) =>
						Effect.sync(() => {
							if (data.id === options.companyId) companies += 1;
						}),
				)
				.with(
					{
						type: TypeEnumSchema.enum.supplier,
					},
					(supplier) =>
						supplier.data.companyId !== options.companyId
							? Effect.void
							: encodeRecordFx(supplier, {
									format: "intermediate",
									maxRecordBytes: 1024 * 1024,
								}).pipe(
									Effect.flatMap((bytes) =>
										storeFx(`supplier-${supplier.data.id}.ndjson`, bytes),
									),
								),
				)
				.with(
					{
						type: TypeEnumSchema.enum.received_invoice,
					},
					({ data }) => {
						if (
							data.companyId !== options.companyId ||
							(options.invoiceId !== null && data.id !== options.invoiceId)
						)
							return Effect.void;
						return storeFx(`invoice-${data.id}`, new Uint8Array()).pipe(
							Effect.tap(() =>
								Effect.sync(() => {
									invoices += 1;
								}),
							),
						);
					},
				)
				.with(
					{
						type: P.union(
							TypeEnumSchema.enum.office,
							TypeEnumSchema.enum.client,
							TypeEnumSchema.enum.invoice_request,
						),
					},
					() => Effect.void,
				)
				.exhaustive(),
		),
	);
	if (companies !== 1)
		return yield* Effect.fail(
			new ExportError({
				detail: `Expected exactly one source company ${options.companyId}; found ${companies}.`,
			}),
		);
	if (invoices === 0)
		return yield* Effect.fail(
			new ExportError({
				detail: "No invoices match the export selection.",
			}),
		);
	return invoices;
});
