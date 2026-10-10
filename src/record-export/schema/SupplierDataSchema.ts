import type { z } from "zod";
import { SupplierSchema } from "~/accounting-record/schema/SupplierSchema";

/** Explicit intermediate output fields for supplier; field validation policies are shared with the admitted model. */
export const SupplierDataSchema = SupplierSchema.pick({
	companyId: true,
	id: true,
	name: true,
	registrationNumber: true,
	taxNumber: true,
	street: true,
	city: true,
	postalCode: true,
	country: true,
	account: true,
	note: true,
})
	.strict()
	.meta({
		id: "record-export.SupplierDataSchema",
		description:
			"Explicit intermediate output fields for supplier; field validation policies are shared with the admitted model.",
	});
export type SupplierDataSchema = typeof SupplierDataSchema;
export namespace SupplierDataSchema {
	export type Type = z.infer<SupplierDataSchema>;
}
