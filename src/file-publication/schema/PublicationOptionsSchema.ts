import { z } from "zod";

/** Mechanical publication limits; the producer must also bound records before allocating them. */
export const PublicationOptionsSchema = z
	.object({
		output: z.string().min(1),
		maxChunkBytes: z
			.int()
			.min(1)
			.max(16 * 1024 * 1024)
			.default(64 * 1024),
	})
	.strict()
	.meta({
		id: "file-publication.PublicationOptionsSchema",
		description:
			"Destination and maximum accepted byte-chunk size for atomic single-file publication.",
	});
export type PublicationOptionsSchema = typeof PublicationOptionsSchema;
export namespace PublicationOptionsSchema {
	export type Type = z.infer<PublicationOptionsSchema>;
}
