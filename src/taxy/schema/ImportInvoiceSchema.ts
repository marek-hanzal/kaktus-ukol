import { z } from "zod";
import { IdSchema } from "~/accounting-value/schema/IdSchema";
import { ImportSupplierSchema } from "./ImportSupplierSchema";
import { ImportBuyerSchema } from "./ImportBuyerSchema";
import { ImportVatBreakdownSchema } from "./ImportVatBreakdownSchema";
/** One untrusted TAXY invoice; its correlation ID is required even when business fields are incomplete. */
export const ImportInvoiceSchema = z
	.object({
		id: IdSchema,
		klientId: z.int().positive().nullable().optional(),
		typ: z.string().nullable().optional(),
		stav: z.string().nullable().optional(),
		cisloDokladu: z.string().nullable().optional(),
		variabilniSymbol: z.string().nullable().optional(),
		dodavatel: ImportSupplierSchema.nullable().optional(),
		odberatel: ImportBuyerSchema.nullable().optional(),
		datumVystaveni: z.string().nullable().optional(),
		duzp: z.string().nullable().optional(),
		datumSplatnosti: z.string().nullable().optional(),
		rozpisDph: ImportVatBreakdownSchema.nullable().optional(),
		celkem: z.unknown().optional(),
		mena: z.string().nullable().optional(),
		kurz: z.unknown().optional(),
		popis: z.string().nullable().optional(),
	})
	.strict()
	.meta({
		id: "taxy.ImportInvoiceSchema",
		description:
			"One untrusted TAXY invoice; its correlation ID is required even when business fields are incomplete.",
	});
export type ImportInvoiceSchema = typeof ImportInvoiceSchema;
export namespace ImportInvoiceSchema {
	export type Type = z.infer<ImportInvoiceSchema>;
}
