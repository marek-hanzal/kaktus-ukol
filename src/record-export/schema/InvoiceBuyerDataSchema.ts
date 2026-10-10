import type { z } from "zod";
import { InvoiceBuyerSchema } from "~/accounting-record/schema/InvoiceBuyerSchema";

/** Explicit public fields and shared value policies for InvoiceBuyer. */
export const InvoiceBuyerDataSchema = InvoiceBuyerSchema.pick({
	name: true,
	registrationNumber: true,
})
	.strict()
	.meta({
		id: "record-export.InvoiceBuyerDataSchema",
		description: "Explicit public fields and shared value policies for InvoiceBuyer.",
	});
export type InvoiceBuyerDataSchema = typeof InvoiceBuyerDataSchema;
export namespace InvoiceBuyerDataSchema {
	export type Type = z.infer<InvoiceBuyerDataSchema>;
}
