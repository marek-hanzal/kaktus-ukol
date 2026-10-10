import { z } from "zod";
import { DateSchema } from "~/accounting-value/schema/DateSchema";
import { CurrencySchema } from "~/accounting-value/schema/CurrencySchema";
import { DecimalTextSchema } from "~/accounting-value/schema/DecimalTextSchema";
import { KaktusAmountSchema } from "./KaktusAmountSchema";
import { KaktusTextSchema } from "./KaktusTextSchema";
import { KaktusSupplierSchema } from "./KaktusSupplierSchema";
import { KaktusProvenanceSchema } from "./KaktusProvenanceSchema";

/** Exact public XML invoice projection, independently validated before encoding. */
export const KaktusInvoiceSchema = z
	.object({
		provenance: KaktusProvenanceSchema,
		CisloDodavatele: KaktusTextSchema.min(1).max(20),
		VarSymbol: KaktusTextSchema.max(10),
		Dodavatel: KaktusSupplierSchema,
		DatumVystaveni: DateSchema,
		DatumZdanPlneni: DateSchema,
		DatumSplatnosti: DateSchema.nullable(),
		Zaklad0: KaktusAmountSchema,
		Zaklad12: KaktusAmountSchema,
		DPH12: KaktusAmountSchema,
		Zaklad21: KaktusAmountSchema,
		DPH21: KaktusAmountSchema,
		Celkem: KaktusAmountSchema,
		Mena: CurrencySchema,
		Kurz: DecimalTextSchema.regex(
			/^\d{1,5}(?:\.\d{1,4})?$/,
			"Exchange rate must fit N(10,4)",
		).nullable(),
		Text: KaktusTextSchema.max(50),
		Poznamka: KaktusTextSchema.max(60),
	})
	.strict()
	.meta({
		id: "record-export.KaktusInvoiceSchema",
		description: "Lossless Kaktus 3.2 received-invoice XML wire contract.",
	});
export type KaktusInvoiceSchema = typeof KaktusInvoiceSchema;
export namespace KaktusInvoiceSchema {
	export type Type = z.infer<KaktusInvoiceSchema>;
}
