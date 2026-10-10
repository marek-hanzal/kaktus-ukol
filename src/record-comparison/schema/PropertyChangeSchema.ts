import { z } from "zod";

export const PropertyChangeSchema = z
	.object({
		property: z.string().min(1),
		before: z.json(),
		after: z.json(),
	})
	.strict()
	.meta({
		id: "record-comparison.PropertyChangeSchema",
	});
export type PropertyChangeSchema = typeof PropertyChangeSchema;
export namespace PropertyChangeSchema {
	export type Type = z.infer<PropertyChangeSchema>;
}
