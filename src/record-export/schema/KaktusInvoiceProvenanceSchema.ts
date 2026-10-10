import { z } from "zod";
import { KaktusProvenanceSchema } from "./KaktusProvenanceSchema";
import { KaktusRequestProvenanceSchema } from "./KaktusRequestProvenanceSchema";

export const KaktusInvoiceProvenanceSchema = z
	.union([
		KaktusProvenanceSchema,
		KaktusRequestProvenanceSchema,
	])
	.meta({
		id: "record-export.KaktusInvoiceProvenanceSchema",
	});
export type KaktusInvoiceProvenanceSchema = typeof KaktusInvoiceProvenanceSchema;
export namespace KaktusInvoiceProvenanceSchema {
	export type Type = z.infer<KaktusInvoiceProvenanceSchema>;
}
