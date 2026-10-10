import { z } from "zod";
import { CompanyRegistrationNumberSchema } from "~/accounting-value/schema/CompanyRegistrationNumberSchema";
import { KaktusTextSchema } from "./KaktusTextSchema";

/** Explicit vendor XML fields, bounded by the supplied ADRESAR table. */
export const KaktusSupplierSchema = z
	.object({
		Nazev: KaktusTextSchema.min(1).max(40),
		ICO: CompanyRegistrationNumberSchema.nullable(),
		DIC: KaktusTextSchema.max(14).nullable(),
		Ulice: KaktusTextSchema.max(40),
		Mesto: KaktusTextSchema.max(30),
		PSC: KaktusTextSchema.max(6),
		Stat: KaktusTextSchema.regex(/^[A-Z]{2}$/),
		Ucet: KaktusTextSchema.max(30),
	})
	.strict()
	.meta({
		id: "record-export.KaktusSupplierSchema",
		description: "Selected supplier fields of the Kaktus import protocol.",
	});
export type KaktusSupplierSchema = typeof KaktusSupplierSchema;
export namespace KaktusSupplierSchema {
	export type Type = z.infer<KaktusSupplierSchema>;
}
