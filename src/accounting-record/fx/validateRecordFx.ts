import { Effect } from "effect";
import { match } from "ts-pattern";
import type { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import type { RecordValidationError } from "~/record-validation/error/RecordValidationError";
import { CompanyRecordSchema } from "../schema/CompanyRecordSchema";
import { SupplierRecordSchema } from "../schema/SupplierRecordSchema";
import { InvoiceRecordSchema } from "../schema/InvoiceRecordSchema";
import type { RecordSchema } from "../schema/RecordSchema";

/** The only admission boundary from unknown business values to complete accounting records. */
export const validateRecordFx = Effect.fnUntraced(function* (
	record: IntermediateRecordSchema.Type,
): Effect.fn.Return<RecordSchema.Type, RecordValidationError> {
	const schema = match(record.type)
		.with(TypeEnumSchema.enum.company, () => CompanyRecordSchema)
		.with(TypeEnumSchema.enum.supplier, () => SupplierRecordSchema)
		.with(TypeEnumSchema.enum.received_invoice, () => InvoiceRecordSchema)
		.exhaustive();
	return yield* parseRecordFx(
		schema,
		record,
		`${record.source.origin}:${record.source.location}#${record.source.record}`,
	);
});
