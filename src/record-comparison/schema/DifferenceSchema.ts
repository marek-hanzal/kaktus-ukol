import { z } from "zod";
import { IdentitySchema } from "./IdentitySchema";
import { PropertyChangeSchema } from "./PropertyChangeSchema";
export const DifferenceSchema = z
	.object({
		identity: IdentitySchema,
		changes: z.array(PropertyChangeSchema),
	})
	.strict()
	.meta({
		id: "record-comparison.DifferenceSchema",
	});
export type DifferenceSchema = typeof DifferenceSchema;
export namespace DifferenceSchema {
	export type Type = z.infer<DifferenceSchema>;
}
