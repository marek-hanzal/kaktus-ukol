import { z } from "zod";
import { CompanyIdSchema } from "~/kaktus/schema/CompanyIdSchema";
export const ResponseHeaderSchema = z
	.object({
		firma: CompanyIdSchema,
		zapsano: z
			.string()
			.regex(/^\d{1,2}$/)
			.transform(Number),
		odmitnuto: z
			.string()
			.regex(/^\d{1,2}$/)
			.transform(Number),
	})
	.strict()
	.meta({
		id: "kaktus-write.ResponseHeaderSchema",
	});
export type ResponseHeaderSchema = typeof ResponseHeaderSchema;
export namespace ResponseHeaderSchema {
	export type Type = z.infer<ResponseHeaderSchema>;
}
