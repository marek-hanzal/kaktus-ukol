import { z } from "zod";
import { PublishedFileSchema } from "~/file-publication/schema/PublishedFileSchema";
import { FormatEnumSchema } from "~/record-export/schema/FormatEnumSchema";

/** Receipt returned only after every record passed validation and publication completed. */
export const ImportSummarySchema = z
	.object({
		records: z.int().nonnegative(),
		format: FormatEnumSchema,
		publication: PublishedFileSchema,
		log: z.string().min(1),
	})
	.strict()
	.meta({
		id: "record-import.ImportSummarySchema",
		description:
			"Receipt returned only after every record passed validation and publication completed.",
	});
export type ImportSummarySchema = typeof ImportSummarySchema;
export namespace ImportSummarySchema {
	export type Type = z.infer<ImportSummarySchema>;
}
