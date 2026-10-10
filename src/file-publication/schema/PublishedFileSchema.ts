import { z } from "zod";

/** Receipt returned only after the complete staged file has replaced the destination. */
export const PublishedFileSchema = z
	.object({
		path: z.string().min(1),
		bytes: z.int().nonnegative(),
	})
	.strict()
	.meta({
		id: "file-publication.PublishedFileSchema",
		description:
			"Receipt returned only after the complete staged file has replaced the destination.",
	});
export type PublishedFileSchema = typeof PublishedFileSchema;
export namespace PublishedFileSchema {
	export type Type = z.infer<PublishedFileSchema>;
}
