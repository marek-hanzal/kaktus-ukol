import { z } from "zod";
import { CompanyRecordSchema } from "./CompanyRecordSchema";
import { SupplierRecordSchema } from "./SupplierRecordSchema";
import { InvoiceRecordSchema } from "./InvoiceRecordSchema";

/** Strict public output contract; every variant is accepted by our loose intermediate reader. */
export const IntermediateOutputSchema = z
	.discriminatedUnion("type", [
		CompanyRecordSchema,
		SupplierRecordSchema,
		InvoiceRecordSchema,
	])
	.meta({
		id: "record-export.IntermediateOutputSchema",
		description:
			"Strict public output contract; every variant is accepted by our loose intermediate reader.",
	});
export type IntermediateOutputSchema = typeof IntermediateOutputSchema;
export namespace IntermediateOutputSchema {
	export type Type = z.infer<IntermediateOutputSchema>;
}
