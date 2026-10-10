import { z } from "zod";
import { AttemptStatusEnumSchema } from "./AttemptStatusEnumSchema";
import { PlanSchema } from "./PlanSchema";
export const AttemptSchema = z
	.object({
		requestId: PlanSchema.shape.requestId,
		companyId: PlanSchema.shape.companyId,
		fingerprint: PlanSchema.shape.fingerprint,
		status: AttemptStatusEnumSchema,
		documentNumber: z
			.string()
			.regex(/^FP\d{6}$/)
			.nullable(),
		run: z.string().min(1),
		batch: z.string().min(1),
	})
	.strict()
	.refine((attempt) => (attempt.status === "written") === (attempt.documentNumber !== null), {
		message: "Only a confirmed write carries a target document number",
	})
	.meta({
		id: "kaktus-write.AttemptSchema",
	});
export type AttemptSchema = typeof AttemptSchema;
export namespace AttemptSchema {
	export type Type = z.infer<AttemptSchema>;
}
