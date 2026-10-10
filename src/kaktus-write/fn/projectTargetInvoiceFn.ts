import type { InvoiceSchema } from "~/accounting-record/schema/InvoiceSchema";
import { formatDecimalFn } from "~/accounting-value/fn/formatDecimalFn";
import type { TargetInvoiceSchema } from "../schema/TargetInvoiceSchema";

export const projectTargetInvoiceFn = (data: InvoiceSchema.Type): TargetInvoiceSchema.Type => ({
	supplierNumber: data.supplierNumber,
	variableSymbol: data.variableSymbol,
	issuedOn: data.issuedOn,
	taxableOn: data.taxableOn,
	dueOn: data.dueOn,
	base0: formatDecimalFn(data.vat.base0),
	base12: formatDecimalFn(data.vat.base12),
	vat12: formatDecimalFn(data.vat.vat12),
	base21: formatDecimalFn(data.vat.base21),
	vat21: formatDecimalFn(data.vat.vat21),
	total: formatDecimalFn(data.total),
	currency: data.currency,
	exchangeRate: data.exchangeRate === null ? null : formatDecimalFn(data.exchangeRate),
	text: data.text,
	note: data.note,
});
