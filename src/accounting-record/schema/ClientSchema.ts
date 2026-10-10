import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
/** One office-owned client mapping; authorization still requires live target verification. */
export const ClientSchema = z
	.object({
		id: z.int().positive(),
		name: z.string().min(1),
		registrationNumber: CompanyRegistrationNumberSchema,
	})
	.strict()
	.meta({
		id: "accounting-record.ClientSchema",
		description:
			"One office-owned client mapping; authorization still requires live target verification.",
	});
export type ClientSchema = typeof ClientSchema;
export namespace ClientSchema {
	export type Type = z.infer<ClientSchema>;
}
