import { z } from "zod";

/** One TAXY office header, independent of the streamed client records. */
export const OfficeSchema = z
	.object({
		id: z.int().positive(),
		name: z.string().min(1),
	})
	.strict()
	.meta({
		id: "taxy.OfficeSchema",
		description: "One TAXY office header, independent of the streamed client records.",
	});
export type OfficeSchema = typeof OfficeSchema;
export namespace OfficeSchema {
	export type Type = z.infer<OfficeSchema>;
}
