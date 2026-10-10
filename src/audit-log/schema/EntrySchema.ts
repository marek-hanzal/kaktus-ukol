import { z } from "zod";
import { PhaseEnumSchema } from "./PhaseEnumSchema";
import { OperationSchema } from "./OperationSchema";
export const EntrySchema = OperationSchema.extend({
	operationId: z.uuid(),
	timestamp: z.iso.datetime(),
	phase: PhaseEnumSchema,
	detail: z.string().max(8192),
}).meta({
	id: "audit-log.EntrySchema",
});
export type EntrySchema = typeof EntrySchema;
export namespace EntrySchema {
	export type Type = z.infer<EntrySchema>;
}
