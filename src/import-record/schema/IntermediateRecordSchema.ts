import { z } from "zod";
import { TypeEnumSchema } from "./TypeEnumSchema";
import { SourceSchema } from "./SourceSchema";
import { PayloadSchema } from "./PayloadSchema";
import { KaktusMetaSchema } from "./KaktusMetaSchema";

/** Source-independent input envelope; only routing and provenance are validated here. */
export const IntermediateRecordSchema = z
	.object({
		type: TypeEnumSchema,
		source: SourceSchema,
		kaktus: KaktusMetaSchema.optional(),
		data: PayloadSchema,
	})
	.strict()
	.meta({
		id: "import-record.IntermediateRecordSchema",
		description:
			"Source-independent input envelope; only routing and provenance are validated here.",
	});
export type IntermediateRecordSchema = typeof IntermediateRecordSchema;
export namespace IntermediateRecordSchema {
	export type Type = z.infer<IntermediateRecordSchema>;
}
