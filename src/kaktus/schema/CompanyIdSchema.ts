import { z } from "zod";
import { IdSchema } from "~/accounting-value/schema/IdSchema";
/** Exact four-digit Kaktus company identity. */
export const CompanyIdSchema = IdSchema.regex(/^\d{4}$/).meta({
	id: "kaktus.CompanyIdSchema",
	description: "Exact four-digit Kaktus company identity.",
});
export type CompanyIdSchema = typeof CompanyIdSchema;
export namespace CompanyIdSchema {
	export type Type = z.infer<CompanyIdSchema>;
}
