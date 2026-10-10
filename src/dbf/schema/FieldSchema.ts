import { z } from "zod";
import { FieldTypeEnumSchema } from "./FieldTypeEnumSchema";

export const FieldSchema = z
	.object({
		name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]{0,9}$/),
		type: FieldTypeEnumSchema,
		length: z.int().min(1).max(255),
		decimals: z.int().min(0).max(254),
	})
	.strict()
	.refine((field) => field.type !== "D" || field.length === 8, "Date fields require eight bytes")
	.refine((field) => field.type !== "L" || field.length === 1, "Logical fields require one byte")
	.refine(
		(field) => (field.type === "N" ? field.decimals < field.length : field.decimals === 0),
		"Invalid field decimal count",
	)
	.meta({
		id: "dbf.FieldSchema",
		description: "One bounded, supported dBase III field descriptor.",
	});
export type FieldSchema = typeof FieldSchema;
export namespace FieldSchema {
	export type Type = z.infer<FieldSchema>;
}
