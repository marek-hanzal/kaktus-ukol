import { z } from "zod";

export const EncodingEnumSchema = z
	.enum([
		"auto",
		"cp852",
		"windows-1250",
	])
	.meta({
		id: "dbf.EncodingEnumSchema",
		description: "Explicit text encoding or selection from a recognized DBF language driver.",
	});
export type EncodingEnumSchema = typeof EncodingEnumSchema;
export namespace EncodingEnumSchema {
	export type Type = z.infer<EncodingEnumSchema>;
}
