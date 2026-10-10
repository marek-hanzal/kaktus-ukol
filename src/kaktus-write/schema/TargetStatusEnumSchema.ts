import { z } from "zod";
export const TargetStatusEnumSchema = z
	.enum([
		"missing",
		"present",
		"conflict",
		"ambiguous",
	])
	.meta({
		id: "kaktus-write.TargetStatusEnumSchema",
	});
export type TargetStatusEnumSchema = typeof TargetStatusEnumSchema;
export namespace TargetStatusEnumSchema {
	export type Type = z.infer<TargetStatusEnumSchema>;
}
