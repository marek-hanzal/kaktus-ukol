import { z } from "zod";
import { SourceSchema } from "~/import-record/schema/SourceSchema";
import { CompanyIdSchema } from "~/kaktus/schema/CompanyIdSchema";
import { KaktusInvoiceSchema } from "~/record-export/schema/KaktusInvoiceSchema";
export const PlanSchema = z
	.object({
		requestId: z.string().min(1),
		companyId: CompanyIdSchema,
		source: SourceSchema,
		businessKey: z.string().regex(/^[a-f0-9]{64}$/),
		invoice: KaktusInvoiceSchema,
	})
	.strict()
	.meta({
		id: "kaktus-write.PlanSchema",
	});
export type PlanSchema = typeof PlanSchema;
export namespace PlanSchema {
	export type Type = z.infer<PlanSchema>;
}
