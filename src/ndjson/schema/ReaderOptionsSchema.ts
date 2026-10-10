import { z } from "zod";

/** Bounded UTF-8 NDJSON input; the byte limit includes a possible carriage return. */
export const ReaderOptionsSchema = z
	.object({
		path: z.string().min(1),
		maxRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024)
			.default(64 * 1024),
		chunkBytes: z
			.int()
			.min(1)
			.max(64 * 1024)
			.default(16 * 1024),
	})
	.strict()
	.meta({
		id: "ndjson.ReaderOptionsSchema",
		description:
			"Bounded UTF-8 NDJSON input; the byte limit includes a possible carriage return.",
	});
export type ReaderOptionsSchema = typeof ReaderOptionsSchema;
export namespace ReaderOptionsSchema {
	export type Type = z.infer<ReaderOptionsSchema>;
}
