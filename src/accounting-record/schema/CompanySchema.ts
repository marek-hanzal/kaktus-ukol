import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
import { IdSchema } from "~/accounting-value/schema/IdSchema";
/** Normalized accounting company; folder is source metadata, never a trusted filesystem path. */
export const CompanySchema = z
	.object({
		id: IdSchema,
		name: z.string().min(1),
		registrationNumber: CompanyRegistrationNumberSchema,
		taxNumber: z.string().nullable(),
		folder: z.string().min(1),
		vatPayer: z.boolean(),
	})
	.strict()
	.meta({
		id: "accounting-record.CompanySchema",
		description:
			"Normalized accounting company; folder is source metadata, never a trusted filesystem path.",
	});
export type CompanySchema = typeof CompanySchema;
export namespace CompanySchema {
	export type Type = z.infer<CompanySchema>;
}
