import { z } from "zod";
import { EncodingEnumSchema } from "./EncodingEnumSchema";

export const ReaderOptionsSchema = z
	.object({
		path: z.string().min(1),
		encoding: EncodingEnumSchema.default("auto"),
		maxRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024)
			.default(64 * 1024),
	})
	.strict()
	.meta({
		id: "dbf.ReaderOptionsSchema",
		description: "Bounded, read-only DBF input options.",
	});
export type ReaderOptionsSchema = typeof ReaderOptionsSchema;
export namespace ReaderOptionsSchema {
	export type Type = z.infer<ReaderOptionsSchema>;
}
