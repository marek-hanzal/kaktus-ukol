import { z } from "zod";

export const InvoiceStatusEnumSchema = z
	.enum([
		"schvaleno",
	])
	.meta({
		id: "example.InvoiceStatusEnumSchema",
		description: "Exact approval status in the supplied JSON protocol.",
	});
export type InvoiceStatusEnumSchema = typeof InvoiceStatusEnumSchema;
export namespace InvoiceStatusEnumSchema {
	export type Type = z.infer<InvoiceStatusEnumSchema>;
}
