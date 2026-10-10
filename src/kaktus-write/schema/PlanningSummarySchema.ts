import { z } from "zod";
export const PlanningSummarySchema = z
	.object({
		planned: z.int().nonnegative(),
		rejected: z.int().nonnegative(),
		alreadyPresent: z.int().nonnegative(),
	})
	.strict()
	.meta({
		id: "kaktus-write.PlanningSummarySchema",
	});
export type PlanningSummarySchema = typeof PlanningSummarySchema;
export namespace PlanningSummarySchema {
	export type Type = z.infer<PlanningSummarySchema>;
}
