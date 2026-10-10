import { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SourceSchema } from "./SourceSchema";
import { KaktusMetaSchema } from "./KaktusMetaSchema";
import { InvoiceDataSchema } from "./InvoiceDataSchema";

/** A complete received_invoice on the intermediate output wire. */
export const InvoiceRecordSchema = z
	.object({
		type: TypeEnumSchema.extract([
			"received_invoice",
		]),
		source: SourceSchema,
		kaktus: KaktusMetaSchema.optional(),
		data: InvoiceDataSchema,
	})
	.strict()
	.meta({
		id: "record-export.InvoiceRecordSchema",
		description: "A complete received_invoice on the intermediate output wire.",
	});
export type InvoiceRecordSchema = typeof InvoiceRecordSchema;
export namespace InvoiceRecordSchema {
	export type Type = z.infer<InvoiceRecordSchema>;
}
