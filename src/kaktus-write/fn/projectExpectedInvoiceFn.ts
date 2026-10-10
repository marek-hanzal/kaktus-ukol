import type { KaktusInvoiceSchema } from "~/record-export/schema/KaktusInvoiceSchema";
import type { TargetInvoiceSchema } from "../schema/TargetInvoiceSchema";

/** Kaktus stores rate one for CZK, including when the XML omits it. */
export const projectExpectedInvoiceFn = (
	invoice: KaktusInvoiceSchema.Type,
): TargetInvoiceSchema.Type => ({
	supplierNumber: invoice.CisloDodavatele,
	variableSymbol: invoice.VarSymbol,
	issuedOn: invoice.DatumVystaveni,
	taxableOn: invoice.DatumZdanPlneni,
	dueOn: invoice.DatumSplatnosti,
	base0: invoice.Zaklad0,
	base12: invoice.Zaklad12,
	vat12: invoice.DPH12,
	base21: invoice.Zaklad21,
	vat21: invoice.DPH21,
	total: invoice.Celkem,
	currency: invoice.Mena,
	exchangeRate: invoice.Mena === "CZK" ? "1" : invoice.Kurz,
	text: invoice.Text,
	note: invoice.Poznamka,
});
