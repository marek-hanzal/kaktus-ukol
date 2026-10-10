import type { ImportSummarySchema } from "../schema/ImportSummarySchema";
import { escapeLineFn } from "~/text-output/fn/escapeLineFn";
export const formatImportSummaryFn = (summary: ImportSummarySchema.Type): string =>
	[
		`Succeeded: ${summary.records} validated records published (${summary.publication.bytes} bytes).`,
		`Output: ${escapeLineFn(summary.publication.path)}`,
		`Processing log: ${escapeLineFn(summary.log)}`,
		`Audit: ${escapeLineFn(summary.audit.path)}; operation ${summary.audit.operationId}; completion ${summary.audit.completion}`,
	].join("\n");
