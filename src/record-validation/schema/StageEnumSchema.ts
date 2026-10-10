import { z } from "zod";

/** The boundary that rejected an input record. */
export const StageEnumSchema = z
	.enum([
		"intermediate",
		"domain",
	])
	.meta({
		id: "record-validation.StageEnumSchema",
		description: "The boundary that rejected an input record.",
	});
export type StageEnumSchema = typeof StageEnumSchema;
export namespace StageEnumSchema {
	export type Type = z.infer<StageEnumSchema>;
}
