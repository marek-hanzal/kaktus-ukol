import { z } from "zod";
import { ReceiptSchema } from "~/audit-log/schema/ReceiptSchema";
import { PublishedFileSchema } from "~/file-publication/schema/PublishedFileSchema";
import { CompanyIdSchema } from "./CompanyIdSchema";
import { BatchSummarySchema } from "~/record-validation/schema/BatchSummarySchema";

export const ExportSummarySchema = BatchSummarySchema.safeExtend({
	records: z.int().positive(),
	companyId: CompanyIdSchema,
	publication: PublishedFileSchema,
	log: z.string().min(1),
	audit: ReceiptSchema,
}).meta({
	id: "kaktus.ExportSummarySchema",
	description: "Published XML batch and separately acknowledged operation audit.",
});
export type ExportSummarySchema = typeof ExportSummarySchema;
export namespace ExportSummarySchema {
	export type Type = z.infer<ExportSummarySchema>;
}
