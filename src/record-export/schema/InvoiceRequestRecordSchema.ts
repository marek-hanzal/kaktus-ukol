import { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SourceSchema } from "./SourceSchema";
import { KaktusMetaSchema } from "./KaktusMetaSchema";
import { InvoiceRequestDataSchema } from "./InvoiceRequestDataSchema";

/** Complete public invoice_request with explicit provenance and metadata. */
export const InvoiceRequestRecordSchema = z
	.object({
		type: TypeEnumSchema.extract([
			"invoice_request",
		]),
		source: SourceSchema,
		kaktus: KaktusMetaSchema.optional(),
		data: InvoiceRequestDataSchema,
	})
	.strict()
	.meta({
		id: "record-export.InvoiceRequestRecordSchema",
		description: "Complete public invoice_request with explicit provenance and metadata.",
	});
export type InvoiceRequestRecordSchema = typeof InvoiceRequestRecordSchema;
export namespace InvoiceRequestRecordSchema {
	export type Type = z.infer<InvoiceRequestRecordSchema>;
}
