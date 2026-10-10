import type { z } from "zod";
import { VatLineSchema } from "~/accounting-record/schema/VatLineSchema";
import { DecimalTextSchema } from "~/accounting-value/schema/DecimalTextSchema";

/** Explicit public fields and shared value policies for VatLine. */
export const VatLineDataSchema = VatLineSchema.pick({
	rate: true,
	base: true,
	tax: true,
})
	.extend({
		base: DecimalTextSchema,
		tax: DecimalTextSchema,
	})
	.strict()
	.meta({
		id: "record-export.VatLineDataSchema",
		description: "Explicit public fields and shared value policies for VatLine.",
	});
export type VatLineDataSchema = typeof VatLineDataSchema;
export namespace VatLineDataSchema {
	export type Type = z.infer<VatLineDataSchema>;
}
