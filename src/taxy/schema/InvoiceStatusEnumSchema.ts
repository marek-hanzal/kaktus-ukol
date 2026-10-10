import { z } from "zod";

/** Only an approved TAXY invoice can enter the domain contract. */
export const InvoiceStatusEnumSchema = z
	.enum([
		"approved",
	])
	.meta({
		id: "taxy.InvoiceStatusEnumSchema",
		description: "Only an approved TAXY invoice can enter the domain contract.",
	});
export type InvoiceStatusEnumSchema = typeof InvoiceStatusEnumSchema;
export namespace InvoiceStatusEnumSchema {
	export type Type = z.infer<InvoiceStatusEnumSchema>;
}
