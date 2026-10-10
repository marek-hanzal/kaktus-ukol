import { z } from "zod";
import { ActorSchema } from "~/audit-log/schema/ActorSchema";
import { BestEffortSchema } from "~/record-validation/schema/BestEffortSchema";
export const WriteOptionsSchema = z
	.object({
		input: z.string().min(1),
		simulator: z.string().min(1).default("kaktus/kaktus.cjs"),
		output: z.string().min(1).default(".out/write.txt"),
		state: z.string().min(1).default(".out/kaktus-write-state"),
		actor: ActorSchema,
		bestEffort: BestEffortSchema,
		maxRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024)
			.default(64 * 1024),
	})
	.strict()
	.meta({
		id: "kaktus-write.WriteOptionsSchema",
	});
export type WriteOptionsSchema = typeof WriteOptionsSchema;
export namespace WriteOptionsSchema {
	export type Type = z.infer<WriteOptionsSchema>;
}
