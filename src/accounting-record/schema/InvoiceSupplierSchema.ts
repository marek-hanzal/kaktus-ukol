import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
/** Complete supplier contract; foreign suppliers may have no Czech company identifier. */
export const InvoiceSupplierSchema = z
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
		id: "accounting-record.InvoiceSupplierSchema",
		description:
			"Complete supplier contract; foreign suppliers may have no Czech company identifier.",
	});
export type InvoiceSupplierSchema = typeof InvoiceSupplierSchema;
export namespace InvoiceSupplierSchema {
	export type Type = z.infer<InvoiceSupplierSchema>;
}
