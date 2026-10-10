import { BigDecimal } from "effect";
import { z } from "zod";

/** Internal exact decimal; at most four meaningful fractional digits and 1 MiB of plain text. */
export const DecimalSchema = z
	.custom<BigDecimal.BigDecimal>(
		(value) =>
			BigDecimal.isBigDecimal(value) &&
			typeof value.value === "bigint" &&
			typeof value.scale === "number",
		{
			message: "Expected an Effect BigDecimal",
		},
	)
	.superRefine((value, context) => {
		// Bound the representation before normalization or allocating its decimal text.
		if (
			!Number.isSafeInteger(value.scale) ||
			Math.abs(value.scale) > 1024 * 1024 ||
			String(value.value).length > 1024 * 1024
		) {
			context.addIssue({
				code: "custom",
				message: "Decimal representation exceeds the 1 MiB resource limit",
			});
			return;
		}
		const normalized = BigDecimal.normalize(value);
		if (normalized.scale > 4) {
			context.addIssue({
				code: "custom",
				message: "Decimal exceeds 4 fractional digits; implicit rounding is forbidden",
			});
			return;
		}
		const signLength = normalized.value < 0n ? 1 : 0;
		const coefficientLength = String(normalized.value).length;
		const textLength =
			normalized.scale > 0
				? Math.max(coefficientLength, normalized.scale + 1 + signLength) + 1
				: coefficientLength - normalized.scale;
		if (textLength > 1024 * 1024)
			context.addIssue({
				code: "custom",
				message: "Decimal text exceeds the 1 MiB resource limit",
			});
	})
	.meta({
		id: "accounting-value.DecimalSchema",
		description:
			"Internal exact decimal; at most four meaningful fractional digits and 1 MiB of plain text.",
	});
export type DecimalSchema = typeof DecimalSchema;
export namespace DecimalSchema {
	export type Type = z.infer<DecimalSchema>;
}
