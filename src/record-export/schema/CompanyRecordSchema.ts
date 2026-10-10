import { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SourceSchema } from "./SourceSchema";
import { CompanyDataSchema } from "./CompanyDataSchema";

/** A complete company on the intermediate output wire. */
export const CompanyRecordSchema = z
	.object({
		type: TypeEnumSchema.extract([
			"company",
		]),
		source: SourceSchema,
		data: CompanyDataSchema,
	})
	.strict()
	.meta({
		id: "record-export.CompanyRecordSchema",
		description: "A complete company on the intermediate output wire.",
	});
export type CompanyRecordSchema = typeof CompanyRecordSchema;
export namespace CompanyRecordSchema {
	export type Type = z.infer<CompanyRecordSchema>;
}
