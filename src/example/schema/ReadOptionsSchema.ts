import { z } from "zod";
import { ActorSchema } from "~/audit-log/schema/ActorSchema";
import { ExportOptionsSchema } from "~/record-export/schema/ExportOptionsSchema";
import { BestEffortSchema } from "~/record-validation/schema/BestEffortSchema";

/** The supplied TAXY JSON directory converted to the shared intermediate format. */
export const ReadOptionsSchema = z
	.object({
		input: z.string().min(1),
		output: z.string().min(1),
		actor: ActorSchema,
		bestEffort: BestEffortSchema,
		maxRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024)
			.default(64 * 1024),
		maxOutputRecordBytes: ExportOptionsSchema.shape.maxRecordBytes,
	})
	.strict()
	.meta({
		id: "example.ReadOptionsSchema",
		description:
			"The supplied TAXY JSON directory converted to the shared intermediate format.",
	});
export type ReadOptionsSchema = typeof ReadOptionsSchema;
export namespace ReadOptionsSchema {
	export type Type = z.infer<ReadOptionsSchema>;
}
