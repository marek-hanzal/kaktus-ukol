import { BigDecimal } from "effect";
import { z } from "zod";
import { InvoiceRecordSchema } from "~/accounting-record/schema/InvoiceRecordSchema";
import { SupplierRecordSchema } from "~/accounting-record/schema/SupplierRecordSchema";

/** Target-only admission policies; the source accounting schemas remain unchanged. */
export const KaktusInvoiceAdmissionSchema = z
	.object({
		invoice: InvoiceRecordSchema,
		supplier: SupplierRecordSchema,
	})
	.strict()
	.superRefine(({ invoice, supplier }, context) => {
		const data = invoice.data;
		const partner = supplier.data;
		const sum = [
			data.vat.base0,
			data.vat.base12,
			data.vat.vat12,
			data.vat.base21,
			data.vat.vat21,
		].reduce((total, value) => BigDecimal.sum(total, value), BigDecimal.fromBigInt(0n));

		if (!BigDecimal.equals(sum, data.total))
			context.addIssue({
				code: "custom",
				path: [
					"Celkem",
				],
				message: "Total differs from the exact sum of bases and VAT",
			});
		if (data.paidOn !== null)
			context.addIssue({
				code: "custom",
				path: [
					"paidOn",
				],
				message: "Kaktus XML cannot preserve payment dates",
			});
		if (partner.companyId !== data.companyId || partner.id !== data.supplierId)
			context.addIssue({
				code: "custom",
				path: [
					"Dodavatel",
				],
				message: "Supplier identity does not match invoice",
			});
		if (
			data.currency !== "CZK" &&
			(data.exchangeRate === null || !BigDecimal.isPositive(data.exchangeRate))
		)
			context.addIssue({
				code: "custom",
				path: [
					"Kurz",
				],
				message: "Foreign currency requires a positive exchange rate",
			});
		if (
			data.currency === "CZK" &&
			data.exchangeRate !== null &&
			!BigDecimal.equals(data.exchangeRate, BigDecimal.fromBigInt(1n))
		)
			context.addIssue({
				code: "custom",
				path: [
					"Kurz",
				],
				message: "CZK exchange rate must be one or absent",
			});
	})
	.meta({
		id: "record-export.KaktusInvoiceAdmissionSchema",
		description: "Exact target write admission for a resolved accounting invoice and supplier.",
	});
export type KaktusInvoiceAdmissionSchema = typeof KaktusInvoiceAdmissionSchema;
export namespace KaktusInvoiceAdmissionSchema {
	export type Type = z.infer<KaktusInvoiceAdmissionSchema>;
}
