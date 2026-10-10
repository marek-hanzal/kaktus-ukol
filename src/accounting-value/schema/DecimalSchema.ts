import { z } from "zod";

/** Lossless decimal text for decoded Kaktus monetary values; never use binary arithmetic. */
export const DecimalSchema = z
	.string()
	.regex(/^-?\d+(?:\.\d+)?$/)
	.meta({
		id: "accounting-value.DecimalSchema",
		description:
			"Lossless decimal text for decoded Kaktus monetary values; never use binary arithmetic.",
	});
export type DecimalSchema = typeof DecimalSchema;
export namespace DecimalSchema {
	export type Type = z.infer<DecimalSchema>;
}
