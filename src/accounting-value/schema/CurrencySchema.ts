import { z } from "zod";

/** Three-letter currency code; support is decided by write admission. */
export const CurrencySchema = z
	.string()
	.regex(/^[A-Z]{3}$/)
	.meta({
		id: "accounting-value.CurrencySchema",
		description: "Three-letter currency code; support is decided by write admission.",
	});
export type CurrencySchema = typeof CurrencySchema;
export namespace CurrencySchema {
	export type Type = z.infer<CurrencySchema>;
}
