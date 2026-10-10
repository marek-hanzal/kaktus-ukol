import { z } from "zod";

/** Plain decimal text with at most four fractional digits; never rounded or coerced. */
export const DecimalTextSchema = z
	.string()
	.max(1024 * 1024)
	.regex(/^-?\d+(?:\.\d{1,4})?$/, {
		message: "Expected decimal text with at most 4 fractional digits and no exponent notation",
	})
	.meta({
		id: "accounting-value.DecimalTextSchema",
		description:
			"Plain decimal text with at most four fractional digits; never rounded or coerced.",
	});
export type DecimalTextSchema = typeof DecimalTextSchema;
export namespace DecimalTextSchema {
	export type Type = z.infer<DecimalTextSchema>;
}
