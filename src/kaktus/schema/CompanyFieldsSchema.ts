import { z } from "zod";
import { FieldTypeEnumSchema } from "~/dbf/schema/FieldTypeEnumSchema";

export const CompanyFieldsSchema = z
	.object({
		ID: z.literal(FieldTypeEnumSchema.enum.C),
		NAZEV: z.literal(FieldTypeEnumSchema.enum.C),
		ICO: z.literal(FieldTypeEnumSchema.enum.C),
		DIC: z.literal(FieldTypeEnumSchema.enum.C),
		SLOZKA: z.literal(FieldTypeEnumSchema.enum.C),
		PLATCE: z.literal(FieldTypeEnumSchema.enum.L),
	})
	.strict()
	.meta({
		id: "kaktus.CompanyFieldsSchema",
		description: "Exact FIRMY.DBF column names and storage types.",
	});
export type CompanyFieldsSchema = typeof CompanyFieldsSchema;
export namespace CompanyFieldsSchema {
	export type Type = z.infer<CompanyFieldsSchema>;
}
