import { z } from "zod";

/** Explicit consent to omit rejected records and review the processing log. */
export const BestEffortSchema = z.boolean().default(false).meta({
	id: "record-validation.BestEffortSchema",
	description: "Explicit consent to omit rejected records and review the processing log.",
});
export type BestEffortSchema = typeof BestEffortSchema;
export namespace BestEffortSchema {
	export type Type = z.infer<BestEffortSchema>;
}
