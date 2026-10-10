import { z } from "zod";

/** Known Kaktus routing and source identifiers, never authorization or a trusted path. */
export const KaktusMetaSchema = z
	.object({
		companyId: z
			.string()
			.regex(/^\d{4}$/)
			.optional(),
		folder: z.string().min(1).optional(),
		supplierId: z.int().nonnegative().optional(),
		invoiceId: z.int().nonnegative().optional(),
	})
	.strict()
	.meta({
		id: "import-record.KaktusMetaSchema",
		description:
			"Known Kaktus routing and source identifiers, never authorization or a trusted path.",
	});
export type KaktusMetaSchema = typeof KaktusMetaSchema;
export namespace KaktusMetaSchema {
	export type Type = z.infer<KaktusMetaSchema>;
}
