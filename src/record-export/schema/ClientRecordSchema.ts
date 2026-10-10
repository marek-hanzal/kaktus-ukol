import { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SourceSchema } from "./SourceSchema";
import { KaktusMetaSchema } from "./KaktusMetaSchema";
import { ClientDataSchema } from "./ClientDataSchema";

/** Complete public client with explicit provenance and metadata. */
export const ClientRecordSchema = z
	.object({
		type: TypeEnumSchema.extract([
			"client",
		]),
		source: SourceSchema,
		kaktus: KaktusMetaSchema.optional(),
		data: ClientDataSchema,
	})
	.strict()
	.meta({
		id: "record-export.ClientRecordSchema",
		description: "Complete public client with explicit provenance and metadata.",
	});
export type ClientRecordSchema = typeof ClientRecordSchema;
export namespace ClientRecordSchema {
	export type Type = z.infer<ClientRecordSchema>;
}
