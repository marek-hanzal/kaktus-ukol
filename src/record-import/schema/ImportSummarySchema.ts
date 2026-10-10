import { z } from "zod";
import { ReceiptSchema } from "~/audit-log/schema/ReceiptSchema";
import { ImportResultSchema } from "./ImportResultSchema";
/** Complete data result and the independently acknowledged operation audit. */
export const ImportSummarySchema = ImportResultSchema.safeExtend({
	audit: ReceiptSchema,
}).meta({
	id: "record-import.ImportSummarySchema",
	description: "Complete data publication and independent audit completion receipt.",
});
export type ImportSummarySchema = typeof ImportSummarySchema;
export namespace ImportSummarySchema {
	export type Type = z.infer<ImportSummarySchema>;
}
