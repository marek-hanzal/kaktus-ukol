import { z } from "zod";

/** A published batch reports every omitted record and the required human review. */
export const BatchSummarySchema = z
	.object({
		bestEffort: z.boolean(),
		records: z.int().nonnegative(),
		rejectedRecords: z.int().nonnegative(),
		reviewRequired: z.boolean(),
	})
	.strict()
	.refine(
		(summary) => {
			const hasRejections = summary.rejectedRecords > 0;
			return (
				summary.reviewRequired === hasRejections &&
				(!hasRejections || (summary.bestEffort && summary.records > 0))
			);
		},
		{
			path: [
				"reviewRequired",
			],
			message: "Omissions require best-effort consent, a nonempty result and review.",
		},
	)
	.meta({
		id: "record-validation.BatchSummarySchema",
		description: "Published batch counts, explicit processing policy and required review.",
	});
export type BatchSummarySchema = typeof BatchSummarySchema;
export namespace BatchSummarySchema {
	export type Type = z.infer<BatchSummarySchema>;
}
