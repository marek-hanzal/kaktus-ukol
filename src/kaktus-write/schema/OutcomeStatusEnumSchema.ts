import { z } from "zod";
export const OutcomeStatusEnumSchema = z
	.enum([
		"written",
		"already_written",
		"rejected",
		"not_attempted",
		"unknown",
	])
	.meta({
		id: "kaktus-write.OutcomeStatusEnumSchema",
	});
export type OutcomeStatusEnumSchema = typeof OutcomeStatusEnumSchema;
export namespace OutcomeStatusEnumSchema {
	export type Type = z.infer<OutcomeStatusEnumSchema>;
}
