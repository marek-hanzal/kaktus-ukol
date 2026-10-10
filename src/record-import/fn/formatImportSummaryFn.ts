import type { ImportSummarySchema } from "../schema/ImportSummarySchema";
import { escapeLineFn } from "~/text-output/fn/escapeLineFn";
import { formatBatchSummaryFn } from "~/record-validation/fn/formatBatchSummaryFn";
export const formatImportSummaryFn = (summary: ImportSummarySchema.Type): string =>
	[
		`${summary.reviewRequired ? "Completed with omissions" : "Succeeded"}: ${summary.records} validated records published (${summary.publication.bytes} bytes).`,
		formatBatchSummaryFn(summary),
		`Output: ${escapeLineFn(summary.publication.path)}`,
		`Processing log: ${escapeLineFn(summary.log)}`,
		`Audit: ${escapeLineFn(summary.audit.path)}; operation ${summary.audit.operationId}; completion ${summary.audit.completion}`,
	].join("\n");
