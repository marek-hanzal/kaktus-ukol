import { z } from "zod";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SupplierSchema } from "./SupplierSchema";

/** Validated supplier record with preserved provenance. */
export const SupplierRecordSchema = IntermediateRecordSchema.extend({
	type: TypeEnumSchema.extract([
		"supplier",
	]),
	data: SupplierSchema,
}).meta({
	id: "accounting-record.SupplierRecordSchema",
	description: "Validated supplier record with preserved provenance.",
});
export type SupplierRecordSchema = typeof SupplierRecordSchema;
export namespace SupplierRecordSchema {
	export type Type = z.infer<SupplierRecordSchema>;
}
