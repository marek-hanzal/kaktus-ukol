import { z } from "zod";

/** Untrusted supplier input; omitted and null business fields survive until domain validation. */
export const ImportSupplierSchema = z
	.object({
		nazev: z.string().nullable().optional(),
		ico: z.string().nullable().optional(),
		dic: z.string().nullable().optional(),
		ulice: z.string().nullable().optional(),
		mesto: z.string().nullable().optional(),
		psc: z.string().nullable().optional(),
		stat: z.string().nullable().optional(),
	})
	.strict()
	.meta({
		id: "taxy.ImportSupplierSchema",
		description:
			"Untrusted supplier input; omitted and null business fields survive until domain validation.",
	});
export type ImportSupplierSchema = typeof ImportSupplierSchema;
export namespace ImportSupplierSchema {
	export type Type = z.infer<ImportSupplierSchema>;
}
