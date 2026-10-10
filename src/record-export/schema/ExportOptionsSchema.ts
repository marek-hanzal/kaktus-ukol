import { z } from "zod";
import { FormatEnumSchema } from "./FormatEnumSchema";

/** Output encoding and independent maximum UTF-8 record bytes, excluding LF. */
export const ExportOptionsSchema = z
	.object({
		format: FormatEnumSchema.default(FormatEnumSchema.enum.intermediate),
		maxRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024)
			.default(64 * 1024),
	})
	.strict()
	.meta({
		id: "record-export.ExportOptionsSchema",
		description: "Output encoding and independent maximum UTF-8 record bytes, excluding LF.",
	});
export type ExportOptionsSchema = typeof ExportOptionsSchema;
export namespace ExportOptionsSchema {
	export type Type = z.infer<ExportOptionsSchema>;
}
