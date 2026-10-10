import type { z } from "zod";
import { KaktusMetaSchema as InputKaktusMetaSchema } from "~/import-record/schema/KaktusMetaSchema";

/** Explicit Kaktus metadata fields on the public intermediate wire. */
export const KaktusMetaSchema = InputKaktusMetaSchema.pick({
	companyId: true,
	folder: true,
	supplierId: true,
	invoiceId: true,
})
	.strict()
	.meta({
		id: "record-export.KaktusMetaSchema",
		description: "Explicit Kaktus metadata fields on the public intermediate wire.",
	});
export type KaktusMetaSchema = typeof KaktusMetaSchema;
export namespace KaktusMetaSchema {
	export type Type = z.infer<KaktusMetaSchema>;
}
