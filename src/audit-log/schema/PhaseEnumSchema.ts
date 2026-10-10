import { z } from "zod";

export const PhaseEnumSchema = z
	.enum([
		"started",
		"succeeded",
		"failed",
	])
	.meta({
		id: "audit-log.PhaseEnumSchema",
	});
export type PhaseEnumSchema = typeof PhaseEnumSchema;
export namespace PhaseEnumSchema {
	export type Type = z.infer<PhaseEnumSchema>;
}
