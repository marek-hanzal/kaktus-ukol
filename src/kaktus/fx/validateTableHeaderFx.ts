import { Effect } from "effect";
import { match } from "ts-pattern";
import type { HeaderSchema } from "~/dbf/schema/HeaderSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { CompanyFieldsSchema } from "../schema/CompanyFieldsSchema";
import { SupplierFieldsSchema } from "../schema/SupplierFieldsSchema";
import { InvoiceFieldsSchema } from "../schema/InvoiceFieldsSchema";
import { TableMappingError } from "../error/TableMappingError";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import type { RecordTypeEnumSchema } from "../schema/RecordTypeEnumSchema";

/** Verify the known table's protocol signature before projecting its values. */
export const validateTableHeaderFx = Effect.fn("validateTableHeaderFx")(function* (
	header: HeaderSchema.Type,
	requested: RecordTypeEnumSchema.Type,
	path: string,
) {
	const layout = Object.fromEntries(
		header.fields.map((field) => [
			field.name,
			field.type,
		]),
	);
	const schema = match(requested)
		.with(TypeEnumSchema.enum.company, () => CompanyFieldsSchema)
		.with(TypeEnumSchema.enum.supplier, () => SupplierFieldsSchema)
		.with(TypeEnumSchema.enum.received_invoice, () => InvoiceFieldsSchema)
		.exhaustive();
	yield* parseRecordFx(schema, layout, path).pipe(
		Effect.catchTag("RecordValidationError", (error) =>
			Effect.fail(
				new TableMappingError({
					path,
					detail: error.message,
				}),
			),
		),
	);
});
