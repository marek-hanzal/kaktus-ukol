import type { z } from "zod";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { ClientSchema } from "./ClientSchema";

/** Complete client with preserved provenance and target metadata. */
export const ClientRecordSchema = IntermediateRecordSchema.extend({
	type: TypeEnumSchema.extract([
		"client",
	]),
	data: ClientSchema,
})
	.refine((record) => record.kaktus?.companyId !== undefined, {
		path: [
			"kaktus",
			"companyId",
		],
		message: "A client mapping requires a Kaktus company ID.",
	})
	.meta({
		id: "accounting-record.ClientRecordSchema",
		description: "Complete client with preserved provenance and target metadata.",
	});
export type ClientRecordSchema = typeof ClientRecordSchema;
export namespace ClientRecordSchema {
	export type Type = z.infer<ClientRecordSchema>;
}
