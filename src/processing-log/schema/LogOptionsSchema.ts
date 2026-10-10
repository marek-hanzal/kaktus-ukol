import { z } from "zod";

/** Host-selected append-only diagnostic destination and bounded event size. */
export const LogOptionsSchema = z
	.object({
		path: z.string().min(1),
		maxEventBytes: z
			.int()
			.min(1)
			.max(1024 * 1024)
			.default(64 * 1024),
	})
	.strict()
	.meta({
		id: "processing-log.LogOptionsSchema",
		description: "Processing log file and maximum encoded size of one human-readable event.",
	});
export type LogOptionsSchema = typeof LogOptionsSchema;
export namespace LogOptionsSchema {
	export type Type = z.infer<LogOptionsSchema>;
}
