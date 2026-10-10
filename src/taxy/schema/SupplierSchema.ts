import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
/** Complete supplier contract; foreign suppliers may have no Czech company identifier. */
export const SupplierSchema = z
	.object({
		name: z.string().min(1),
		registrationNumber: CompanyRegistrationNumberSchema.nullable(),
		taxNumber: z.string().nullable(),
		street: z.string(),
		city: z.string(),
		postalCode: z.string(),
		country: z.string().regex(/^[A-Z]{2}$/),
	})
	.strict()
	.meta({
		id: "taxy.SupplierSchema",
		description:
			"Complete supplier contract; foreign suppliers may have no Czech company identifier.",
	});
export type SupplierSchema = typeof SupplierSchema;
export namespace SupplierSchema {
	export type Type = z.infer<SupplierSchema>;
}
