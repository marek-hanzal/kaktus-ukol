import type { z } from "zod";
import { OfficeSchema } from "~/accounting-record/schema/OfficeSchema";

/** Explicit public fields and shared value policies for Office. */
export const OfficeDataSchema = OfficeSchema.pick({
	id: true,
	name: true,
})
	.strict()
	.meta({
		id: "record-export.OfficeDataSchema",
		description: "Explicit public fields and shared value policies for Office.",
	});
export type OfficeDataSchema = typeof OfficeDataSchema;
export namespace OfficeDataSchema {
	export type Type = z.infer<OfficeDataSchema>;
}
