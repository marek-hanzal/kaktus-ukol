import { z } from "zod";
import { DecimalTextSchema } from "~/accounting-value/schema/DecimalTextSchema";

/** Target N(12,2) amount; domain precision remains four places. */
export const KaktusAmountSchema = DecimalTextSchema.regex(
	/^(?:\d{1,9}|-\d{1,8})(?:\.\d{1,2})?$/,
	"Kaktus amounts require at most 2 fractional digits and must fit N(12,2)",
).meta({
	id: "record-export.KaktusAmountSchema",
	description: "Exact Kaktus amount text, without rounding or target field overflow.",
});
export type KaktusAmountSchema = typeof KaktusAmountSchema;
export namespace KaktusAmountSchema {
	export type Type = z.infer<KaktusAmountSchema>;
}
