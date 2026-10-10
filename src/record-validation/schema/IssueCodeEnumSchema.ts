import { z } from "zod";

/** Zod validation issue codes. */
export const IssueCodeEnumSchema = z
	.enum([
		"invalid_type",
		"too_big",
		"too_small",
		"invalid_format",
		"not_multiple_of",
		"unrecognized_keys",
		"invalid_union",
		"invalid_key",
		"invalid_element",
		"invalid_value",
		"custom",
	])
	.meta({
		id: "record-validation.IssueCodeEnumSchema",
		description: "Zod validation issue codes.",
	});
export type IssueCodeEnumSchema = typeof IssueCodeEnumSchema;
export namespace IssueCodeEnumSchema {
	export type Type = z.infer<IssueCodeEnumSchema>;
}
