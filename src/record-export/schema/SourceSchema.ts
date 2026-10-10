import type { z } from "zod";
import { SourceSchema as ImportSourceSchema } from "~/import-record/schema/SourceSchema";

/** Explicit intermediate output fields for source; field validation policies are shared with the admitted model. */
export const SourceSchema = ImportSourceSchema.pick({
	origin: true,
	location: true,
	record: true,
})
	.strict()
	.meta({
		id: "record-export.SourceSchema",
		description:
			"Explicit intermediate output fields for source; field validation policies are shared with the admitted model.",
	});
export type SourceSchema = typeof SourceSchema;
export namespace SourceSchema {
	export type Type = z.infer<SourceSchema>;
}
