import { z } from "zod";
import { DecimalTextSchema } from "~/accounting-value/schema/DecimalTextSchema";

/** Explicit VAT output fields using plain decimal text. */
export const VatDataSchema = z
	.object({
		base0: DecimalTextSchema,
		base12: DecimalTextSchema,
		vat12: DecimalTextSchema,
		base21: DecimalTextSchema,
		vat21: DecimalTextSchema,
	})
	.strict()
	.meta({
		id: "record-export.VatDataSchema",
		description: "Explicit VAT output fields using plain decimal text.",
	});
export type VatDataSchema = typeof VatDataSchema;
export namespace VatDataSchema {
	export type Type = z.infer<VatDataSchema>;
}
