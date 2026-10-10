import { z } from "zod";

export const SourceFileEnumSchema = z
	.enum([
		"clients",
		"invoices",
	])
	.meta({
		id: "example.SourceFileEnumSchema",
		description: "The two supplied example JSON document layouts.",
	});
export type SourceFileEnumSchema = typeof SourceFileEnumSchema;
export namespace SourceFileEnumSchema {
	export type Type = z.infer<SourceFileEnumSchema>;
}
