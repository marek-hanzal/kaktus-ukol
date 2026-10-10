import { z } from "zod";

export const RowSchema = z
	.object({
		number: z.int().positive(),
		deleted: z.boolean(),
		fields: z.record(z.string(), z.string()),
	})
	.strict()
	.meta({
		id: "dbf.RowSchema",
		description: "Physical DBF slot with padding removed; numeric values remain exact text.",
	});
export type RowSchema = typeof RowSchema;
export namespace RowSchema {
	export type Type = z.infer<RowSchema>;
}
