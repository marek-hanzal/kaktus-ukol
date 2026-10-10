import { z } from "zod";
export const ResponseSuccessSchema = z
	.object({
		poradi: z
			.string()
			.regex(/^[1-9]\d?$/)
			.transform(Number),
		stav: z.literal("OK"),
		doklad: z.string().regex(/^FP\d{6}$/),
	})
	.strict()
	.meta({
		id: "kaktus-write.ResponseSuccessSchema",
	});
export type ResponseSuccessSchema = typeof ResponseSuccessSchema;
export namespace ResponseSuccessSchema {
	export type Type = z.infer<ResponseSuccessSchema>;
}
