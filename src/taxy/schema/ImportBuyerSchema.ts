import { z } from "zod";

/** Untrusted buyer input; identity admission is a separate operation. */
export const ImportBuyerSchema = z
	.object({
		nazev: z.string().nullable().optional(),
		ico: z.string().nullable().optional(),
	})
	.strict()
	.meta({
		id: "taxy.ImportBuyerSchema",
		description: "Untrusted buyer input; identity admission is a separate operation.",
	});
export type ImportBuyerSchema = typeof ImportBuyerSchema;
export namespace ImportBuyerSchema {
	export type Type = z.infer<ImportBuyerSchema>;
}
