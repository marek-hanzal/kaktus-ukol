import { z } from "zod";

/** Processing phases; success is emitted only after the operation has completed. */
export const PhaseEnumSchema = z
	.enum([
		"started",
		"progress",
		"succeeded",
		"failed",
	])
	.meta({
		id: "processing-log.PhaseEnumSchema",
		description:
			"Processing phases; success is emitted only after the operation has completed.",
	});
export type PhaseEnumSchema = typeof PhaseEnumSchema;
export namespace PhaseEnumSchema {
	export type Type = z.infer<PhaseEnumSchema>;
}
