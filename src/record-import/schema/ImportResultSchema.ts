import { z } from "zod";
import { PublishedFileSchema } from "~/file-publication/schema/PublishedFileSchema";
import { FormatEnumSchema } from "~/record-export/schema/FormatEnumSchema";

/** Validated publication result before the operation audit receipt is attached. */
export const ImportResultSchema = z
	.object({
		records: z.int().nonnegative(),
		format: FormatEnumSchema,
		publication: PublishedFileSchema,
		log: z.string().min(1),
	})
	.strict()
	.meta({
		id: "record-import.ImportResultSchema",
		description: "Validated publication result before the operation audit receipt is attached.",
	});
export type ImportResultSchema = typeof ImportResultSchema;
export namespace ImportResultSchema {
	export type Type = z.infer<ImportResultSchema>;
}
