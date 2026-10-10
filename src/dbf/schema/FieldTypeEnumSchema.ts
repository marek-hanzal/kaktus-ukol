import { z } from "zod";

export const FieldTypeEnumSchema = z
	.enum([
		"C",
		"N",
		"D",
		"L",
	])
	.meta({
		id: "dbf.FieldTypeEnumSchema",
		description: "Supported dBase III field types; memo and binary fields are rejected.",
	});
export type FieldTypeEnumSchema = typeof FieldTypeEnumSchema;
export namespace FieldTypeEnumSchema {
	export type Type = z.infer<FieldTypeEnumSchema>;
}
