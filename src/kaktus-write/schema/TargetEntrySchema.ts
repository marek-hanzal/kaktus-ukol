import { z } from "zod";
import { TargetInvoiceSchema } from "./TargetInvoiceSchema";

/** Retain one bounded representative and a count; duplicate identities never become a match. */
export const TargetEntrySchema = z
	.object({
		count: z.int().positive(),
		documentNumber: z.string().min(1),
		invoice: TargetInvoiceSchema,
	})
	.strict()
	.meta({
		id: "kaktus-write.TargetEntrySchema",
	});
export type TargetEntrySchema = typeof TargetEntrySchema;
export namespace TargetEntrySchema {
	export type Type = z.infer<TargetEntrySchema>;
}
