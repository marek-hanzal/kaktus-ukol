import { z } from "zod";

/** Known producers of intermediate records; provenance is preserved when replayed. */
export const OriginEnumSchema = z
	.enum([
		"kaktus",
		"intermediate",
		"example",
	])
	.meta({
		id: "import-record.OriginEnumSchema",
		description:
			"Known producers of intermediate records; provenance is preserved when replayed.",
	});
export type OriginEnumSchema = typeof OriginEnumSchema;
export namespace OriginEnumSchema {
	export type Type = z.infer<OriginEnumSchema>;
}
