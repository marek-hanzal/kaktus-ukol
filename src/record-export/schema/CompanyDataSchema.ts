import type { z } from "zod";
import { CompanySchema } from "~/accounting-record/schema/CompanySchema";

/** Explicit intermediate output fields for company; field validation policies are shared with the admitted model. */
export const CompanyDataSchema = CompanySchema.pick({
	id: true,
	name: true,
	registrationNumber: true,
	taxNumber: true,
	folder: true,
	vatPayer: true,
})
	.strict()
	.meta({
		id: "record-export.CompanyDataSchema",
		description:
			"Explicit intermediate output fields for company; field validation policies are shared with the admitted model.",
	});
export type CompanyDataSchema = typeof CompanyDataSchema;
export namespace CompanyDataSchema {
	export type Type = z.infer<CompanyDataSchema>;
}
