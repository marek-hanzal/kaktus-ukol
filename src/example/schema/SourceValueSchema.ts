import { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";

/** One bounded JSON value, independently framed from its surrounding document. */
export const SourceValueSchema = z
	.object({
		type: TypeEnumSchema.extract([
			"office",
			"client",
			"invoice_request",
		]),
		location: z.string().min(1),
		record: z.int().positive(),
		text: z.string(),
	})
	.strict()
	.meta({
		id: "example.SourceValueSchema",
		description: "One bounded JSON value, independently framed from its surrounding document.",
	});
export type SourceValueSchema = typeof SourceValueSchema;
export namespace SourceValueSchema {
	export type Type = z.infer<SourceValueSchema>;
}
