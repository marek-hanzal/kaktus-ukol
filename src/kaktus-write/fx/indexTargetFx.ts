import { Effect, FileSystem, Path, Stream } from "effect";
import { match } from "ts-pattern";
import { createKaktusStreamFx } from "~/kaktus/fx/createKaktusStreamFx";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { validateRecordFx } from "~/accounting-record/fx/validateRecordFx";
import { SupplierRecordSchema } from "~/accounting-record/schema/SupplierRecordSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { encodeRecordFx } from "~/record-export/fx/encodeRecordFx";
import type { WriteOptionsSchema } from "../schema/WriteOptionsSchema";
import { WriteError } from "../error/WriteError";
import { businessIdentityFn } from "../fn/businessIdentityFn";
import { hashValueFx } from "./hashValueFx";
import { readStoredValueFx } from "./readStoredValueFx";
import { storeValueFx } from "./storeValueFx";
import { TargetEntrySchema } from "../schema/TargetEntrySchema";
import { projectTargetInvoiceFn } from "../fn/projectTargetInvoiceFn";

/** Read-only DBF inventory; all target lookups stay on disk. */
export const indexTargetFx = Effect.fn("indexTargetFx")(function* (
	data: string,
	directory: string,
	options: WriteOptionsSchema.Type,
) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	yield* fs.makeDirectory(directory, {
		recursive: true,
	});
	const storeRecordFx = Effect.fnUntraced(function* (
		name: string,
		record: Parameters<typeof encodeRecordFx>[0],
	) {
		const output = path.join(directory, name);
		if (yield* fs.exists(output))
			return yield* Effect.fail(
				new WriteError({
					detail: `Ambiguous target identity ${name}`,
				}),
			);
		const bytes = yield* encodeRecordFx(record, {
			format: "intermediate",
			maxRecordBytes: 1024 * 1024,
		});
		yield* fs.writeFile(output, bytes);
	});
	yield* Stream.unwrap(
		createKaktusStreamFx({
			input: data,
			output: options.output,
			actor: options.actor,
			bestEffort: false,
			encoding: "auto",
			maxRecordBytes: 1024 * 1024,
			maxOutputRecordBytes: 1024 * 1024,
		}),
	).pipe(
		Stream.runForEach((candidate) =>
			Effect.gen(function* () {
				const envelope = yield* parseRecordFx(
					IntermediateRecordSchema,
					candidate.value,
					candidate.input,
				);
				const record = yield* validateRecordFx(envelope);
				yield* match(record)
					.with(
						{
							type: "company",
						},
						(record) => storeRecordFx(`company-${record.data.id}.json`, record),
					)
					.with(
						{
							type: "supplier",
						},
						(record) =>
							storeRecordFx(
								`supplier-${record.data.companyId}-${record.data.id}.json`,
								record,
							),
					)
					.with(
						{
							type: "received_invoice",
						},
						(invoice) =>
							Effect.gen(function* () {
								const supplier = yield* readStoredValueFx(
									path.join(
										directory,
										`supplier-${invoice.data.companyId}-${invoice.data.supplierId}.json`,
									),
									SupplierRecordSchema,
								);
								const key = yield* hashValueFx(
									businessIdentityFn(
										invoice.data.companyId,
										invoice.data.supplierNumber,
										supplier.data.registrationNumber,
										supplier.data.name,
									),
								);
								const output = path.join(directory, `existing-${key}.json`);
								const previous = (yield* fs.exists(output))
									? yield* readStoredValueFx(output, TargetEntrySchema)
									: null;
								const entry = yield* parseRecordFx(
									TargetEntrySchema,
									{
										count: (previous?.count ?? 0) + 1,
										documentNumber:
											previous?.documentNumber ?? invoice.data.documentNumber,
										invoice:
											previous?.invoice ??
											projectTargetInvoiceFn(invoice.data),
									},
									"target inventory entry",
								);
								yield* storeValueFx(output, entry);
							}),
					)
					.with(
						{
							type: "office",
						},
						{
							type: "client",
						},
						{
							type: "invoice_request",
						},
						() => Effect.void,
					)
					.exhaustive();
			}),
		),
	);
});
