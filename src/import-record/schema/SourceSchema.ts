import { z } from "zod";
import { OriginEnumSchema } from "./OriginEnumSchema";

/** Stable provenance supplied by an adapter or an intermediate file. */
export const SourceSchema = z
	.object({
		origin: OriginEnumSchema,
		location: z.string().min(1).max(4096),
		record: z.int().positive(),
	})
	.strict()
	.meta({
		id: "import-record.SourceSchema",
		description: "Stable provenance supplied by an adapter or an intermediate file.",
	});
export type SourceSchema = typeof SourceSchema;
export namespace SourceSchema {
	export type Type = z.infer<SourceSchema>;
}
