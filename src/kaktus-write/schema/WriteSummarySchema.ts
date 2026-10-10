import { z } from "zod";
import { PublishedFileSchema } from "~/file-publication/schema/PublishedFileSchema";
import { ReceiptSchema } from "~/audit-log/schema/ReceiptSchema";
export const WriteSummarySchema = z
	.object({
		bestEffort: z.boolean(),
		written: z.int().nonnegative(),
		alreadyPresent: z.int().nonnegative(),
		rejected: z.int().nonnegative(),
		notAttempted: z.int().nonnegative(),
		unknown: z.int().nonnegative(),
		reviewRequired: z.boolean(),
		publication: PublishedFileSchema,
		run: z.string(),
		log: z.string(),
		audit: ReceiptSchema,
	})
	.strict()
	.refine(
		(summary) =>
			summary.reviewRequired ===
			summary.rejected + summary.notAttempted + summary.unknown > 0,
		{
			path: [
				"reviewRequired",
			],
			message: "Incomplete document outcomes require review",
		},
	)
	.meta({
		id: "kaktus-write.WriteSummarySchema",
	});
export type WriteSummarySchema = typeof WriteSummarySchema;
export namespace WriteSummarySchema {
	export type Type = z.infer<WriteSummarySchema>;
}
