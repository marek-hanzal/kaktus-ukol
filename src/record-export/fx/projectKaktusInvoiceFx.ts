import { Effect } from "effect";
import type { InvoiceRecordSchema } from "~/accounting-record/schema/InvoiceRecordSchema";
import type { SupplierRecordSchema } from "~/accounting-record/schema/SupplierRecordSchema";
import { formatDecimalFn } from "~/accounting-value/fn/formatDecimalFn";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { KaktusInvoiceAdmissionSchema } from "../schema/KaktusInvoiceAdmissionSchema";
import { KaktusInvoiceSchema } from "../schema/KaktusInvoiceSchema";

/** Re-admit domain values and explicitly project every nested wire object. */
export const projectKaktusInvoiceFx = Effect.fnUntraced(function* (
	invoice: InvoiceRecordSchema.Type,
	supplier: SupplierRecordSchema.Type,
) {
	const admitted = yield* parseRecordFx(
		KaktusInvoiceAdmissionSchema,
		{
			invoice,
			supplier,
		},
		`${invoice.source.location}#${invoice.source.record}`,
	);
	const data = admitted.invoice.data;
	const partner = admitted.supplier.data;
	return yield* parseRecordFx(
		KaktusInvoiceSchema,
		{
			provenance: {
				companyId: data.companyId,
				invoiceId: data.id,
				documentNumber: data.documentNumber,
				supplierId: partner.id,
				source: {
					origin: invoice.source.origin,
					location: invoice.source.location,
					record: invoice.source.record,
				},
				supplierSource: {
					origin: supplier.source.origin,
					location: supplier.source.location,
					record: supplier.source.record,
				},
				invoiceKaktus:
					invoice.kaktus === undefined
						? undefined
						: {
								companyId: invoice.kaktus.companyId,
								folder: invoice.kaktus.folder,
								supplierId: invoice.kaktus.supplierId,
								invoiceId: invoice.kaktus.invoiceId,
							},
				supplierKaktus:
					supplier.kaktus === undefined
						? undefined
						: {
								companyId: supplier.kaktus.companyId,
								folder: supplier.kaktus.folder,
								supplierId: supplier.kaktus.supplierId,
								invoiceId: supplier.kaktus.invoiceId,
							},
			},
			CisloDodavatele: data.supplierNumber,
			VarSymbol: data.variableSymbol,
			Dodavatel: {
				Nazev: partner.name,
				ICO: partner.registrationNumber,
				DIC: partner.taxNumber,
				Ulice: partner.street,
				Mesto: partner.city,
				PSC: partner.postalCode,
				Stat: partner.country,
				Ucet: partner.account,
			},
			DatumVystaveni: data.issuedOn,
			DatumZdanPlneni: data.taxableOn,
			DatumSplatnosti: data.dueOn,
			Zaklad0: formatDecimalFn(data.vat.base0),
			Zaklad12: formatDecimalFn(data.vat.base12),
			DPH12: formatDecimalFn(data.vat.vat12),
			Zaklad21: formatDecimalFn(data.vat.base21),
			DPH21: formatDecimalFn(data.vat.vat21),
			Celkem: formatDecimalFn(data.total),
			Mena: data.currency,
			Kurz: data.exchangeRate === null ? null : formatDecimalFn(data.exchangeRate),
			Text: data.text,
			Poznamka: data.note,
		},
		`${invoice.source.location}#${invoice.source.record}`,
	);
});
