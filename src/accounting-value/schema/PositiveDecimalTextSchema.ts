import type { z } from "zod";
import { DecimalTextSchema } from "./DecimalTextSchema";

/** Positive, exact boundary text with the shared decimal syntax and precision limit. */
export const PositiveDecimalTextSchema = DecimalTextSchema.refine(
	(value) => !value.startsWith("-") && /[1-9]/.test(value),
	{
		message: "Exchange rate must be positive",
	},
).meta({
	id: "accounting-value.PositiveDecimalTextSchema",
	description:
		"Positive, exact boundary text with the shared decimal syntax and precision limit.",
});
export type PositiveDecimalTextSchema = typeof PositiveDecimalTextSchema;
export namespace PositiveDecimalTextSchema {
	export type Type = z.infer<PositiveDecimalTextSchema>;
}
