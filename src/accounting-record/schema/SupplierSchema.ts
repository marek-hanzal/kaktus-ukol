import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
import { IdSchema } from "~/accounting-value/schema/IdSchema";
/** Normalized company-scoped supplier. */
export const SupplierSchema = z
	.object({
		companyId: IdSchema,
		id: z.int().nonnegative(),
		name: z.string().min(1),
		registrationNumber: CompanyRegistrationNumberSchema.nullable(),
		taxNumber: z.string().nullable(),
		street: z.string(),
		city: z.string(),
		postalCode: z.string(),
		country: z.string(),
		account: z.string(),
		note: z.string(),
	})
	.strict()
	.meta({
		id: "accounting-record.SupplierSchema",
		description: "Normalized company-scoped supplier.",
	});
export type SupplierSchema = typeof SupplierSchema;
export namespace SupplierSchema {
	export type Type = z.infer<SupplierSchema>;
}
