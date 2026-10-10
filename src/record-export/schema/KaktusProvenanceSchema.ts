import { z } from "zod";
import { SourceSchema } from "./SourceSchema";
import { KaktusMetaSchema } from "./KaktusMetaSchema";

/** Comments correlate target response ordinals to immutable source identities. */
export const KaktusProvenanceSchema = z
	.object({
		companyId: z.string().regex(/^\d{4}$/),
		invoiceId: z.int().nonnegative(),
		documentNumber: z.string().min(1),
		supplierId: z.int().nonnegative(),
		source: SourceSchema,
		supplierSource: SourceSchema,
		invoiceKaktus: KaktusMetaSchema.optional(),
		supplierKaktus: KaktusMetaSchema.optional(),
	})
	.strict()
	.meta({
		id: "record-export.KaktusProvenanceSchema",
		description:
			"Source correlation embedded in XML comments, without changing vendor business fields.",
	});
export type KaktusProvenanceSchema = typeof KaktusProvenanceSchema;
export namespace KaktusProvenanceSchema {
	export type Type = z.infer<KaktusProvenanceSchema>;
}
