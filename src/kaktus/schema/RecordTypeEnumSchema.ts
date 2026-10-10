import type { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";

/** Record variants physically present in Kaktus DBF tables. */
export const RecordTypeEnumSchema = TypeEnumSchema.extract([
	"company",
	"supplier",
	"received_invoice",
]).meta({
	id: "kaktus.RecordTypeEnumSchema",
	description: "Record variants physically present in Kaktus DBF tables.",
});
export type RecordTypeEnumSchema = typeof RecordTypeEnumSchema;
export namespace RecordTypeEnumSchema {
	export type Type = z.infer<RecordTypeEnumSchema>;
}
