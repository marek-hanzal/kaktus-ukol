import { z } from "zod";
import { FieldTypeEnumSchema } from "~/dbf/schema/FieldTypeEnumSchema";

export const SupplierFieldsSchema = z
	.object({
		ID: z.literal(FieldTypeEnumSchema.enum.N),
		NAZEV: z.literal(FieldTypeEnumSchema.enum.C),
		ICO: z.literal(FieldTypeEnumSchema.enum.N),
		DIC: z.literal(FieldTypeEnumSchema.enum.C),
		ULICE: z.literal(FieldTypeEnumSchema.enum.C),
		MESTO: z.literal(FieldTypeEnumSchema.enum.C),
		PSC: z.literal(FieldTypeEnumSchema.enum.C),
		STAT: z.literal(FieldTypeEnumSchema.enum.C),
		UCET: z.literal(FieldTypeEnumSchema.enum.C),
		POZN: z.literal(FieldTypeEnumSchema.enum.C),
	})
	.strict()
	.meta({
		id: "kaktus.SupplierFieldsSchema",
		description: "Exact ADRESAR.DBF column names and storage types.",
	});
export type SupplierFieldsSchema = typeof SupplierFieldsSchema;
export namespace SupplierFieldsSchema {
	export type Type = z.infer<SupplierFieldsSchema>;
}
