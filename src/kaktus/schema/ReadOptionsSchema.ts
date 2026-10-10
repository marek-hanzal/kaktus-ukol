import { z } from "zod";
import { ActorSchema } from "~/audit-log/schema/ActorSchema";
import { EncodingEnumSchema } from "~/dbf/schema/EncodingEnumSchema";
import { ExportOptionsSchema } from "~/record-export/schema/ExportOptionsSchema";
import { ReaderOptionsSchema } from "~/dbf/schema/ReaderOptionsSchema";
import { BestEffortSchema } from "~/record-validation/schema/BestEffortSchema";

export const ReadOptionsSchema = z
	.object({
		input: z.string().min(1),
		output: z.string().min(1),
		actor: ActorSchema,
		bestEffort: BestEffortSchema,
		encoding: EncodingEnumSchema.default("auto"),
		maxRecordBytes: ReaderOptionsSchema.shape.maxRecordBytes,
		maxOutputRecordBytes: ExportOptionsSchema.shape.maxRecordBytes,
	})
	.strict()
	.meta({
		id: "kaktus.ReadOptionsSchema",
		description: "Stream Kaktus DATA into a validated, atomic intermediate export.",
	});
export type ReadOptionsSchema = typeof ReadOptionsSchema;
export namespace ReadOptionsSchema {
	export type Type = z.infer<ReadOptionsSchema>;
}
