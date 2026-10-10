import { z } from "zod";
import { IssueCodeEnumSchema } from "./IssueCodeEnumSchema";

/** One serializable field-level validation issue. */
export const IssueSchema = z
	.object({
		path: z.array(z.string()),
		code: IssueCodeEnumSchema,
		message: z.string(),
	})
	.strict()
	.meta({
		id: "record-validation.IssueSchema",
		description: "One serializable field-level validation issue.",
	});
export type IssueSchema = typeof IssueSchema;
export namespace IssueSchema {
	export type Type = z.infer<IssueSchema>;
}
