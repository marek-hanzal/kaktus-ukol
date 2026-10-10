import { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SourceSchema } from "./SourceSchema";
import { KaktusMetaSchema } from "./KaktusMetaSchema";
import { OfficeDataSchema } from "./OfficeDataSchema";

/** Complete public office with explicit provenance and metadata. */
export const OfficeRecordSchema = z
	.object({
		type: TypeEnumSchema.extract([
			"office",
		]),
		source: SourceSchema,
		kaktus: KaktusMetaSchema.optional(),
		data: OfficeDataSchema,
	})
	.strict()
	.meta({
		id: "record-export.OfficeRecordSchema",
		description: "Complete public office with explicit provenance and metadata.",
	});
export type OfficeRecordSchema = typeof OfficeRecordSchema;
export namespace OfficeRecordSchema {
	export type Type = z.infer<OfficeRecordSchema>;
}
