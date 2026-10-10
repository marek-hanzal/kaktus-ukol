import { z } from "zod";
import { SourceSchema } from "./SourceSchema";

/** TAXY request identity stays distinct from target-assigned invoice identities. */
export const KaktusRequestProvenanceSchema = z
	.object({
		companyId: z.string().regex(/^\d{4}$/),
		requestId: z.string().min(1),
		clientId: z.int().positive(),
		source: SourceSchema,
	})
	.strict()
	.meta({
		id: "record-export.KaktusRequestProvenanceSchema",
	});
export type KaktusRequestProvenanceSchema = typeof KaktusRequestProvenanceSchema;
export namespace KaktusRequestProvenanceSchema {
	export type Type = z.infer<KaktusRequestProvenanceSchema>;
}
