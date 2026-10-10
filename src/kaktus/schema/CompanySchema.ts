import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
import { CompanyIdSchema } from "./CompanyIdSchema";
/** Normalized Kaktus company; filesystem containment is checked by the reader. */
export const CompanySchema = z
	.object({
		id: CompanyIdSchema,
		name: z.string().min(1),
		registrationNumber: CompanyRegistrationNumberSchema,
		taxNumber: z.string().nullable(),
		folder: z.string().min(1),
		vatPayer: z.boolean(),
	})
	.strict()
	.meta({
		id: "kaktus.CompanySchema",
		description: "Normalized Kaktus company; filesystem containment is checked by the reader.",
	});
export type CompanySchema = typeof CompanySchema;
export namespace CompanySchema {
	export type Type = z.infer<CompanySchema>;
}
