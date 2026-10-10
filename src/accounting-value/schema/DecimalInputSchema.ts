import { BigDecimal, Option } from "effect";
import { z } from "zod";
import { DecimalTextSchema } from "./DecimalTextSchema";
import { DecimalSchema } from "./DecimalSchema";

/** Admit decimal text as a normalized BigDecimal, without a binary floating-point intermediate. */
export const DecimalInputSchema = DecimalTextSchema.transform((text, context) => {
	const parsed = BigDecimal.fromString(text);
	if (Option.isNone(parsed)) {
		context.addIssue({
			code: "custom",
			message: "Invalid decimal text",
		});
		return z.NEVER;
	}
	return BigDecimal.normalize(parsed.value);
})
	.pipe(DecimalSchema)
	.meta({
		id: "accounting-value.DecimalInputSchema",
		description:
			"Admit decimal text as a normalized BigDecimal, without a binary floating-point intermediate.",
	});
export type DecimalInputSchema = typeof DecimalInputSchema;
export namespace DecimalInputSchema {
	export type Type = z.infer<DecimalInputSchema>;
	export type Input = z.input<DecimalInputSchema>;
}
