import type { z } from "zod";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { InvoiceRequestSchema } from "./InvoiceRequestSchema";

/** Complete invoice_request with preserved provenance and target metadata. */
export const InvoiceRequestRecordSchema = IntermediateRecordSchema.extend({
	type: TypeEnumSchema.extract([
		"invoice_request",
	]),
	data: InvoiceRequestSchema,
}).meta({
	id: "accounting-record.InvoiceRequestRecordSchema",
	description: "Complete invoice_request with preserved provenance and target metadata.",
});
export type InvoiceRequestRecordSchema = typeof InvoiceRequestRecordSchema;
export namespace InvoiceRequestRecordSchema {
	export type Type = z.infer<InvoiceRequestRecordSchema>;
}
