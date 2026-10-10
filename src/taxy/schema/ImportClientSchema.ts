import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
import { CompanyIdSchema } from "~/kaktus/schema/CompanyIdSchema";
/** One office-owned client mapping; authorization still requires live target verification. */
export const ImportClientSchema = z
	.object({
		klientId: z.int().positive(),
		nazev: z.string().min(1),
		ico: CompanyRegistrationNumberSchema,
		kaktusFirma: CompanyIdSchema,
	})
	.strict()
	.meta({
		id: "taxy.ImportClientSchema",
		description:
			"One office-owned client mapping; authorization still requires live target verification.",
	});
export type ImportClientSchema = typeof ImportClientSchema;
export namespace ImportClientSchema {
	export type Type = z.infer<ImportClientSchema>;
}
