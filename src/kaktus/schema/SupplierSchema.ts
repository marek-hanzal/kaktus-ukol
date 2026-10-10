import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
import { CompanyIdSchema } from "./CompanyIdSchema";
/** Normalized company-scoped address record; numeric DBF IČO must be restored to eight-digit text. */
export const SupplierSchema = z
	.object({
		companyId: CompanyIdSchema,
		id: z.int().nonnegative(),
		name: z.string(),
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
		id: "kaktus.SupplierSchema",
		description:
			"Normalized company-scoped address record; numeric DBF IČO must be restored to eight-digit text.",
	});
export type SupplierSchema = typeof SupplierSchema;
export namespace SupplierSchema {
	export type Type = z.infer<SupplierSchema>;
}
