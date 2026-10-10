import { z } from "zod";
import { ActorSchema } from "~/audit-log/schema/ActorSchema";
export const ComparisonOptionsSchema = z
	.object({
		current: z.string().min(1),
		incoming: z.string().min(1),
		output: z.string().min(1),
		actor: ActorSchema,
		maxRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024),
	})
	.strict()
	.meta({
		id: "record-comparison.ComparisonOptionsSchema",
	});
export type ComparisonOptionsSchema = typeof ComparisonOptionsSchema;
export namespace ComparisonOptionsSchema {
	export type Type = z.infer<ComparisonOptionsSchema>;
}
