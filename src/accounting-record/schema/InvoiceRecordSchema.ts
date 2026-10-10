import { z } from "zod";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { InvoiceSchema } from "./InvoiceSchema";

/** Validated received_invoice record with preserved provenance. */
export const InvoiceRecordSchema = IntermediateRecordSchema.extend({
	type: TypeEnumSchema.extract([
		"received_invoice",
	]),
	data: InvoiceSchema,
}).meta({
	id: "accounting-record.InvoiceRecordSchema",
	description: "Validated received_invoice record with preserved provenance.",
});
export type InvoiceRecordSchema = typeof InvoiceRecordSchema;
export namespace InvoiceRecordSchema {
	export type Type = z.infer<InvoiceRecordSchema>;
}
