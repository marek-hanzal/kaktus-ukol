import { z } from "zod";
import { SourceSchema } from "~/import-record/schema/SourceSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { StageEnumSchema } from "./StageEnumSchema";
import { IssueSchema } from "./IssueSchema";

/** A rejection with physical input position and available logical provenance. */
export const ProblemSchema = z
	.object({
		input: z.string(),
		position: z.int().positive(),
		stage: StageEnumSchema,
		source: SourceSchema.nullable(),
		type: TypeEnumSchema.nullable(),
		issue: IssueSchema,
	})
	.strict()
	.meta({
		id: "record-validation.ProblemSchema",
		description: "A rejection with physical input position and available logical provenance.",
	});
export type ProblemSchema = typeof ProblemSchema;
export namespace ProblemSchema {
	export type Type = z.infer<ProblemSchema>;
}
