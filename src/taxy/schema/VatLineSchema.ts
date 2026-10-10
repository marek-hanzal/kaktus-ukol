import { z } from "zod";
import { DecimalSchema } from "~/accounting-value/schema/DecimalSchema";

/** Complete VAT row for the documented Kaktus rates; sums require separate exact validation. */
export const VatLineSchema = z
	.object({
		rate: z.union([
			z.literal(0),
			z.literal(12),
			z.literal(21),
		]),
		base: DecimalSchema,
		tax: DecimalSchema,
	})
	.strict()
	.meta({
		id: "taxy.VatLineSchema",
		description:
			"Complete VAT row for the documented Kaktus rates; sums require separate exact validation.",
	});
export type VatLineSchema = typeof VatLineSchema;
export namespace VatLineSchema {
	export type Type = z.infer<VatLineSchema>;
}
