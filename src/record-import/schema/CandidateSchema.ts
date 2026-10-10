import { z } from "zod";

/** An adapter's untrusted intermediate value with its physical input position. */
export const CandidateSchema = z
	.object({
		input: z.string().min(1),
		position: z.int().positive(),
		value: z.unknown(),
	})
	.strict()
	.meta({
		id: "record-import.CandidateSchema",
		description: "An adapter's untrusted intermediate value with its physical input position.",
	});
export type CandidateSchema = typeof CandidateSchema;
export namespace CandidateSchema {
	export type Type = z.infer<CandidateSchema>;
}
