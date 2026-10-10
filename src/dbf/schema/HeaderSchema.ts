import { z } from "zod";
import { FieldSchema } from "./FieldSchema";
import { EncodingEnumSchema } from "./EncodingEnumSchema";

export const HeaderSchema = z
	.object({
		recordCount: z.int().nonnegative().max(0xffffffff),
		headerBytes: z.int().min(65).max(65535),
		recordBytes: z.int().min(2).max(65535),
		encoding: EncodingEnumSchema.exclude([
			"auto",
		]),
		fields: z.array(FieldSchema).min(1).max(2046),
	})
	.strict()
	.meta({
		id: "dbf.HeaderSchema",
		description: "Validated dBase III framing and text encoding.",
	});
export type HeaderSchema = typeof HeaderSchema;
export namespace HeaderSchema {
	export type Type = z.infer<HeaderSchema>;
}
