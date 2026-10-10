import { z } from "zod";
export const AttemptStatusEnumSchema = z
	.enum([
		"intent",
		"written",
		"rejected",
	])
	.meta({
		id: "kaktus-write.AttemptStatusEnumSchema",
	});
export type AttemptStatusEnumSchema = typeof AttemptStatusEnumSchema;
export namespace AttemptStatusEnumSchema {
	export type Type = z.infer<AttemptStatusEnumSchema>;
}
