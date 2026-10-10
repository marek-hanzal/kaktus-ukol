import { z } from "zod";
import { CompanyIdSchema } from "./CompanyIdSchema";

/** Resolved source routing, independently of complete company business admission. */
export const CompanySourceSchema = z
	.object({
		companyId: CompanyIdSchema,
		directory: z.string().min(1),
	})
	.strict()
	.meta({
		id: "kaktus.CompanySourceSchema",
		description:
			"Company identity and its canonical directory contained in the Kaktus DATA root.",
	});
export type CompanySourceSchema = typeof CompanySourceSchema;
export namespace CompanySourceSchema {
	export type Type = z.infer<CompanySourceSchema>;
}
