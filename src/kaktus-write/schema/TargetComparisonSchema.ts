import { z } from "zod";
import { TargetStatusEnumSchema } from "./TargetStatusEnumSchema";
import { PropertyChangeSchema } from "~/record-comparison/schema/PropertyChangeSchema";

export const TargetComparisonSchema = z
	.object({
		status: TargetStatusEnumSchema,
		documentNumber: z.string().nullable(),
		count: z.int().nonnegative(),
		changes: z.array(PropertyChangeSchema),
	})
	.strict()
	.meta({
		id: "kaktus-write.TargetComparisonSchema",
	});
export type TargetComparisonSchema = typeof TargetComparisonSchema;
export namespace TargetComparisonSchema {
	export type Type = z.infer<TargetComparisonSchema>;
}
