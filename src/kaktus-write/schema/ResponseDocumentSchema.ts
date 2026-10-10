import { z } from "zod";
import { ResponseSuccessSchema } from "./ResponseSuccessSchema";
import { ResponseRejectionSchema } from "./ResponseRejectionSchema";
export const ResponseDocumentSchema = z
	.discriminatedUnion("stav", [
		ResponseSuccessSchema,
		ResponseRejectionSchema,
	])
	.meta({
		id: "kaktus-write.ResponseDocumentSchema",
	});
export type ResponseDocumentSchema = typeof ResponseDocumentSchema;
export namespace ResponseDocumentSchema {
	export type Type = z.infer<ResponseDocumentSchema>;
}
