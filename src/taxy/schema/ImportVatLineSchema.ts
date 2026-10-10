import { z } from "zod";

/** Untrusted TAXY VAT values; the source decoder must preserve monetary number tokens as decimal text. */
export const ImportVatLineSchema = z
	.object({
		sazba: z.number().nullable().optional(),
		zaklad: z.unknown().optional(),
		dph: z.unknown().optional(),
	})
	.strict()
	.meta({
		id: "taxy.ImportVatLineSchema",
		description:
			"Untrusted TAXY VAT values; the source decoder must preserve monetary number tokens as decimal text.",
	});
export type ImportVatLineSchema = typeof ImportVatLineSchema;
export namespace ImportVatLineSchema {
	export type Type = z.infer<ImportVatLineSchema>;
}
