import { z } from "zod";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { CompanySchema } from "./CompanySchema";

/** Validated company record with preserved provenance. */
export const CompanyRecordSchema = IntermediateRecordSchema.extend({
	type: TypeEnumSchema.extract([
		"company",
	]),
	data: CompanySchema,
}).meta({
	id: "accounting-record.CompanyRecordSchema",
	description: "Validated company record with preserved provenance.",
});
export type CompanyRecordSchema = typeof CompanyRecordSchema;
export namespace CompanyRecordSchema {
	export type Type = z.infer<CompanyRecordSchema>;
}
