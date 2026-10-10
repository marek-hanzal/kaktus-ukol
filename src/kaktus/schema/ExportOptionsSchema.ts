import { z } from "zod";
import { ActorSchema } from "~/audit-log/schema/ActorSchema";
import { CompanyIdSchema } from "./CompanyIdSchema";
import { BestEffortSchema } from "~/record-validation/schema/BestEffortSchema";

/** One company and optionally one immutable invoice from our native intermediate. */
export const ExportOptionsSchema = z
	.object({
		input: z.string().min(1),
		output: z.string().min(1),
		actor: ActorSchema,
		bestEffort: BestEffortSchema,
		companyId: CompanyIdSchema,
		invoiceId: z.int().nonnegative().nullable(),
		maxRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024),
		maxOutputRecordBytes: z
			.int()
			.min(1)
			.max(1024 * 1024),
	})
	.strict()
	.meta({
		id: "kaktus.ExportOptionsSchema",
		description: "Bounded intermediate-to-XML export selection and publication options.",
	});
export type ExportOptionsSchema = typeof ExportOptionsSchema;
export namespace ExportOptionsSchema {
	export type Type = z.infer<ExportOptionsSchema>;
}
