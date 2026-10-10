import type { WriteSummarySchema } from "../schema/WriteSummarySchema";
type Counts = Pick<
	WriteSummarySchema.Type,
	| "bestEffort"
	| "written"
	| "alreadyPresent"
	| "rejected"
	| "notAttempted"
	| "unknown"
	| "reviewRequired"
>;
export const formatWriteSummaryFn = (summary: Counts): string =>
	`Mode: ${summary.bestEffort ? "best-effort" : "strict"}; written: ${summary.written}; already present: ${summary.alreadyPresent}; rejected: ${summary.rejected}; not attempted: ${summary.notAttempted}; unknown: ${summary.unknown}.${summary.reviewRequired ? " WARNING: REVIEW REQUIRED. Inspect the per-document report and processing log; replay always rechecks fresh target data." : ""}`;
