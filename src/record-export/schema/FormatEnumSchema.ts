import { z } from "zod";

/** Supported public output encodings. */
export const FormatEnumSchema = z
	.enum([
		"intermediate",
	])
	.meta({
		id: "record-export.FormatEnumSchema",
		description: "Supported public output encodings.",
	});
export type FormatEnumSchema = typeof FormatEnumSchema;
export namespace FormatEnumSchema {
	export type Type = z.infer<FormatEnumSchema>;
}
