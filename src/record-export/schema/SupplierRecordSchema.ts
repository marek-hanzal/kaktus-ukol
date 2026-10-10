import { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SourceSchema } from "./SourceSchema";
import { KaktusMetaSchema } from "./KaktusMetaSchema";
import { SupplierDataSchema } from "./SupplierDataSchema";

/** A complete supplier on the intermediate output wire. */
export const SupplierRecordSchema = z
	.object({
		type: TypeEnumSchema.extract([
			"supplier",
		]),
		source: SourceSchema,
		kaktus: KaktusMetaSchema.optional(),
		data: SupplierDataSchema,
	})
	.strict()
	.meta({
		id: "record-export.SupplierRecordSchema",
		description: "A complete supplier on the intermediate output wire.",
	});
export type SupplierRecordSchema = typeof SupplierRecordSchema;
export namespace SupplierRecordSchema {
	export type Type = z.infer<SupplierRecordSchema>;
}
