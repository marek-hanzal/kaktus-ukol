import { z } from "zod";

/** One TAXY office header, independent of the streamed client records. */
export const ImportOfficeSchema = z
	.object({
		id: z.int().positive(),
		nazev: z.string().min(1),
	})
	.strict()
	.meta({
		id: "taxy.ImportOfficeSchema",
		description: "One TAXY office header, independent of the streamed client records.",
	});
export type ImportOfficeSchema = typeof ImportOfficeSchema;
export namespace ImportOfficeSchema {
	export type Type = z.infer<ImportOfficeSchema>;
}
