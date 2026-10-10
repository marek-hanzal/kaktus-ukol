import { z } from "zod";
import { DecimalSchema } from "~/accounting-value/schema/DecimalSchema";
/** Lossless VAT totals for one invoice. */
export const VatTotalsSchema = z
	.object({
		base0: DecimalSchema,
		base12: DecimalSchema,
		vat12: DecimalSchema,
		base21: DecimalSchema,
		vat21: DecimalSchema,
	})
	.strict()
	.meta({
		id: "accounting-record.VatTotalsSchema",
		description: "Lossless VAT totals for one invoice.",
	});
export type VatTotalsSchema = typeof VatTotalsSchema;
export namespace VatTotalsSchema {
	export type Type = z.infer<VatTotalsSchema>;
}
