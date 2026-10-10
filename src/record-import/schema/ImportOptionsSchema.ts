import { z } from "zod";

/** One streamed intermediate import with an atomically published validated output. */
export const ImportOptionsSchema = z
	.object({
		input: z.string().min(1),
		output: z.string().min(1),
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
