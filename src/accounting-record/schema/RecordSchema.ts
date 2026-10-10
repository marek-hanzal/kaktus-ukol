import { InvoiceRequestRecordSchema } from "./InvoiceRequestRecordSchema";
import { ClientRecordSchema } from "./ClientRecordSchema";
import { OfficeRecordSchema } from "./OfficeRecordSchema";
import { z } from "zod";
import { CompanyRecordSchema } from "./CompanyRecordSchema";
import { SupplierRecordSchema } from "./SupplierRecordSchema";
import { InvoiceRecordSchema } from "./InvoiceRecordSchema";

/** Complete accounting records admitted by structural domain validation. */
export const RecordSchema = z
	.discriminatedUnion("type", [
		OfficeRecordSchema,
		ClientRecordSchema,
		InvoiceRequestRecordSchema,
		CompanyRecordSchema,
		SupplierRecordSchema,
		InvoiceRecordSchema,
	])
	.meta({
		id: "accounting-record.RecordSchema",
		description: "Complete accounting records admitted by structural domain validation.",
	});
export type RecordSchema = typeof RecordSchema;
export namespace RecordSchema {
	export type Type = z.infer<RecordSchema>;
}
