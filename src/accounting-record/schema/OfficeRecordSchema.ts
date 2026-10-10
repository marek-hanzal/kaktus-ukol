import type { z } from "zod";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { OfficeSchema } from "./OfficeSchema";

/** Complete office with preserved provenance and target metadata. */
export const OfficeRecordSchema = IntermediateRecordSchema.extend({
	type: TypeEnumSchema.extract([
		"office",
	]),
	data: OfficeSchema,
}).meta({
	id: "accounting-record.OfficeRecordSchema",
	description: "Complete office with preserved provenance and target metadata.",
});
export type OfficeRecordSchema = typeof OfficeRecordSchema;
export namespace OfficeRecordSchema {
	export type Type = z.infer<OfficeRecordSchema>;
}
