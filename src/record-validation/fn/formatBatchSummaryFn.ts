import type { BatchSummarySchema } from "../schema/BatchSummarySchema";

export const formatBatchSummaryFn = (summary: BatchSummarySchema.Type): string =>
	`Mode: ${summary.bestEffort ? "best-effort" : "strict"}; accepted: ${summary.records}; rejected: ${summary.rejectedRecords}.` +
	(summary.reviewRequired
		? " WARNING: REVIEW REQUIRED. Records were omitted; inspect the processing log before using this batch."
		: "");
