import { z } from "zod";
import { CompanyIdSchema } from "./CompanyIdSchema";

/** Source routing only; complete company admission remains in accounting-record. */
export const CompanyLocationSchema = z
	.object({
		companyId: CompanyIdSchema,
		folder: z.string().regex(/^[A-Za-z0-9_-]{1,255}$/),
	})
	.strict()
	.meta({
		id: "kaktus.CompanyLocationSchema",
		description: "Company identity and one safe DATA subdirectory segment.",
	});
export type CompanyLocationSchema = typeof CompanyLocationSchema;
export namespace CompanyLocationSchema {
	export type Type = z.infer<CompanyLocationSchema>;
}
