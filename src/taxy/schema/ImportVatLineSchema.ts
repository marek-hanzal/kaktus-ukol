import { z } from "zod";

/** Untrusted numeric VAT row from TAXY; this schema performs no monetary arithmetic. */
export const ImportVatLineSchema = z
	.object({
		sazba: z.number().nullable().optional(),
		zaklad: z.number().nullable().optional(),
		dph: z.number().nullable().optional(),
	})
	.strict()
	.meta({
		id: "taxy.ImportVatLineSchema",
		description:
			"Untrusted numeric VAT row from TAXY; this schema performs no monetary arithmetic.",
	});
export type ImportVatLineSchema = typeof ImportVatLineSchema;
export namespace ImportVatLineSchema {
	export type Type = z.infer<ImportVatLineSchema>;
}
