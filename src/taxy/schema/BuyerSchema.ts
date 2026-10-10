import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
/** Complete buyer identity to be matched against the office mapping and Kaktus. */
export const BuyerSchema = z
	.object({
		name: z.string().min(1),
		registrationNumber: CompanyRegistrationNumberSchema,
	})
	.strict()
	.meta({
		id: "taxy.BuyerSchema",
		description: "Complete buyer identity to be matched against the office mapping and Kaktus.",
	});
export type BuyerSchema = typeof BuyerSchema;
export namespace BuyerSchema {
	export type Type = z.infer<BuyerSchema>;
}
