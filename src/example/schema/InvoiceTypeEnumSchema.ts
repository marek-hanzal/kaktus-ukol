import { z } from "zod";

export const InvoiceTypeEnumSchema = z
	.enum([
		"faktura_prijata",
	])
	.meta({
		id: "example.InvoiceTypeEnumSchema",
		description: "Exact invoice type in the supplied JSON protocol.",
	});
export type InvoiceTypeEnumSchema = typeof InvoiceTypeEnumSchema;
export namespace InvoiceTypeEnumSchema {
	export type Type = z.infer<InvoiceTypeEnumSchema>;
}
