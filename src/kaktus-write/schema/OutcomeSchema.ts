import { z } from "zod";
import { OutcomeStatusEnumSchema } from "./OutcomeStatusEnumSchema";
import { SourceSchema } from "~/import-record/schema/SourceSchema";
import { CompanyIdSchema } from "~/kaktus/schema/CompanyIdSchema";
export const OutcomeSchema = z
	.object({
		source: SourceSchema,
		requestId: z.string().nullable(),
		companyId: CompanyIdSchema.nullable(),
		status: OutcomeStatusEnumSchema,
		code: z.string(),
		detail: z.string(),
		documentNumber: z.string().nullable(),
	})
	.strict()
	.refine(
		(outcome) => {
			const confirmed = outcome.status === "written" || outcome.status === "already_written";
			return confirmed
				? outcome.requestId !== null &&
						outcome.companyId !== null &&
						outcome.documentNumber !== null
				: outcome.documentNumber === null;
		},
		{
			message:
				"Confirmed outcomes require source identity, company and target document number",
		},
	)
	.meta({
		id: "kaktus-write.OutcomeSchema",
	});
export type OutcomeSchema = typeof OutcomeSchema;
export namespace OutcomeSchema {
	export type Type = z.infer<OutcomeSchema>;
}
