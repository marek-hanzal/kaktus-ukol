import { z } from "zod";
import { ActorSchema } from "~/audit-log/schema/ActorSchema";
import { FormatEnumSchema } from "~/record-export/schema/FormatEnumSchema";
import { BestEffortSchema } from "~/record-validation/schema/BestEffortSchema";

/** One streamed intermediate import with an atomically published validated output. */
export const ImportOptionsSchema = z
	.object({
		input: z.string().min(1),
		actor: ActorSchema,
		bestEffort: BestEffortSchema,
		output: z.string().min(1),
		outputFormat: FormatEnumSchema.default(FormatEnumSchema.enum.intermediate),
		maxOutputRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024)
			.default(64 * 1024),
		maxRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024)
			.default(64 * 1024),
	})
	.strict()
	.meta({
		id: "record-import.ImportOptionsSchema",
		description:
			"One streamed intermediate import with an atomically published validated output.",
	});
export type ImportOptionsSchema = typeof ImportOptionsSchema;
export namespace ImportOptionsSchema {
	export type Type = z.infer<ImportOptionsSchema>;
}
