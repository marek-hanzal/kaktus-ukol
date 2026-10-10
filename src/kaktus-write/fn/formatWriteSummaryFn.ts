import type { WriteSummarySchema } from "../schema/WriteSummarySchema";
type Counts = Pick<
	WriteSummarySchema.Type,
	| "bestEffort"
	| "written"
	| "alreadyWritten"
	| "rejected"
	| "notAttempted"
	| "unknown"
	| "reviewRequired"
>;
export const formatWriteSummaryFn = (summary: Counts): string =>
	`Mode: ${summary.bestEffort ? "best-effort" : "strict"}; written: ${summary.written}; already written: ${summary.alreadyWritten}; rejected: ${summary.rejected}; not attempted: ${summary.notAttempted}; unknown: ${summary.unknown}.${summary.reviewRequired ? " WARNING: REVIEW REQUIRED. Inspect the per-document report and processing log; never blindly retry unknown writes." : ""}`;
