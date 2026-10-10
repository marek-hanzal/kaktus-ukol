import { z } from "zod";
export const ResponseRejectionSchema = z
	.object({
		poradi: z
			.string()
			.regex(/^[1-9]\d?$/)
			.transform(Number),
		stav: z.literal("CHYBA"),
		kod: z.string().min(1).max(64),
		zprava: z.string().max(8192),
	})
	.strict()
	.meta({
		id: "kaktus-write.ResponseRejectionSchema",
	});
export type ResponseRejectionSchema = typeof ResponseRejectionSchema;
export namespace ResponseRejectionSchema {
	export type Type = z.infer<ResponseRejectionSchema>;
}
