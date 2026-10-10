import { z } from "zod";
import { FieldTypeEnumSchema } from "~/dbf/schema/FieldTypeEnumSchema";

export const InvoiceFieldsSchema = z
	.object({
		ID: z.literal(FieldTypeEnumSchema.enum.N),
		DOKLAD: z.literal(FieldTypeEnumSchema.enum.C),
		CISLODOD: z.literal(FieldTypeEnumSchema.enum.C),
		VS: z.literal(FieldTypeEnumSchema.enum.C),
		PARTNER: z.literal(FieldTypeEnumSchema.enum.N),
		DATVYST: z.literal(FieldTypeEnumSchema.enum.D),
		DATZDAN: z.literal(FieldTypeEnumSchema.enum.D),
		DATSPL: z.literal(FieldTypeEnumSchema.enum.D),
		DATUHR: z.literal(FieldTypeEnumSchema.enum.D),
		ZAKL0: z.literal(FieldTypeEnumSchema.enum.N),
		ZAKL12: z.literal(FieldTypeEnumSchema.enum.N),
		DPH12: z.literal(FieldTypeEnumSchema.enum.N),
		ZAKL21: z.literal(FieldTypeEnumSchema.enum.N),
		DPH21: z.literal(FieldTypeEnumSchema.enum.N),
		CELKEM: z.literal(FieldTypeEnumSchema.enum.N),
		MENA: z.literal(FieldTypeEnumSchema.enum.C),
		KURZ: z.literal(FieldTypeEnumSchema.enum.N),
		TEXT: z.literal(FieldTypeEnumSchema.enum.C),
		POZN: z.literal(FieldTypeEnumSchema.enum.C),
	})
	.strict()
	.meta({
		id: "kaktus.InvoiceFieldsSchema",
		description: "Exact FAKPRI.DBF column names and storage types.",
	});
export type InvoiceFieldsSchema = typeof InvoiceFieldsSchema;
export namespace InvoiceFieldsSchema {
	export type Type = z.infer<InvoiceFieldsSchema>;
}
