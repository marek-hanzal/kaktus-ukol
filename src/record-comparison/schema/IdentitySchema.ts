import { z } from "zod";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
export const IdentitySchema = z
	.object({
		type: TypeEnumSchema,
		companyId: z.string().nullable(),
		id: z.union([
			z.string(),
			z.int().nonnegative(),
		]),
	})
	.strict()
	.meta({
		id: "record-comparison.IdentitySchema",
	});
export type IdentitySchema = typeof IdentitySchema;
export namespace IdentitySchema {
	export type Type = z.infer<IdentitySchema>;
}
