import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
/** Complete buyer identity to be matched against the office mapping and Kaktus. */
export const InvoiceBuyerSchema = z
	.object({
		name: z.string().min(1),
		registrationNumber: CompanyRegistrationNumberSchema,
	})
	.strict()
	.meta({
		id: "accounting-record.InvoiceBuyerSchema",
		description: "Complete buyer identity to be matched against the office mapping and Kaktus.",
	});
export type InvoiceBuyerSchema = typeof InvoiceBuyerSchema;
export namespace InvoiceBuyerSchema {
	export type Type = z.infer<InvoiceBuyerSchema>;
}
