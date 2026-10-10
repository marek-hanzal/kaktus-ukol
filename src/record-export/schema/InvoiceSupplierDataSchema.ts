import type { z } from "zod";
import { InvoiceSupplierSchema } from "~/accounting-record/schema/InvoiceSupplierSchema";

/** Explicit public fields and shared value policies for InvoiceSupplier. */
export const InvoiceSupplierDataSchema = InvoiceSupplierSchema.pick({
	name: true,
	registrationNumber: true,
	taxNumber: true,
	street: true,
	city: true,
	postalCode: true,
	country: true,
})
	.strict()
	.meta({
		id: "record-export.InvoiceSupplierDataSchema",
		description: "Explicit public fields and shared value policies for InvoiceSupplier.",
	});
export type InvoiceSupplierDataSchema = typeof InvoiceSupplierDataSchema;
export namespace InvoiceSupplierDataSchema {
	export type Type = z.infer<InvoiceSupplierDataSchema>;
}
