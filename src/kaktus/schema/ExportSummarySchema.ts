import { z } from "zod";
import { ReceiptSchema } from "~/audit-log/schema/ReceiptSchema";
import { PublishedFileSchema } from "~/file-publication/schema/PublishedFileSchema";
import { CompanyIdSchema } from "./CompanyIdSchema";

export const ExportSummarySchema = z
	.object({
		records: z.int().positive(),
		companyId: CompanyIdSchema,
		publication: PublishedFileSchema,
		log: z.string().min(1),
		audit: ReceiptSchema,
	})
	.strict()
	.meta({
		id: "kaktus.ExportSummarySchema",
		description: "Published XML batch and separately acknowledged operation audit.",
	});
export type ExportSummarySchema = typeof ExportSummarySchema;
export namespace ExportSummarySchema {
	export type Type = z.infer<ExportSummarySchema>;
}
