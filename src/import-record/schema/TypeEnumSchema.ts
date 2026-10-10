import { z } from "zod";

/** Known accounting record variants. */
export const TypeEnumSchema = z
	.enum([
		"company",
		"supplier",
		"received_invoice",
		"office",
		"client",
		"invoice_request",
	])
	.meta({
		id: "import-record.TypeEnumSchema",
		description: "Known accounting record variants.",
	});
export type TypeEnumSchema = typeof TypeEnumSchema;
export namespace TypeEnumSchema {
	export type Type = z.infer<TypeEnumSchema>;
}
