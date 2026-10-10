import { z } from "zod";

/** Invoice types supported by the current domain. */
export const InvoiceTypeEnumSchema = z
	.enum([
		"received_invoice",
	])
	.meta({
		id: "taxy.InvoiceTypeEnumSchema",
		description: "Invoice types supported by the current domain.",
	});
export type InvoiceTypeEnumSchema = typeof InvoiceTypeEnumSchema;
export namespace InvoiceTypeEnumSchema {
	export type Type = z.infer<InvoiceTypeEnumSchema>;
}
