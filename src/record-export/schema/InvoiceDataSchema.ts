import type { z } from "zod";
import { InvoiceSchema } from "~/accounting-record/schema/InvoiceSchema";
import { DecimalTextSchema } from "~/accounting-value/schema/DecimalTextSchema";
import { VatDataSchema } from "./VatDataSchema";

/** Explicit intermediate output fields for invoice; field validation policies are shared with the admitted model. */
export const InvoiceDataSchema = InvoiceSchema.pick({
	companyId: true,
	id: true,
	documentNumber: true,
	supplierNumber: true,
	variableSymbol: true,
	supplierId: true,
	issuedOn: true,
	taxableOn: true,
	dueOn: true,
	paidOn: true,
	vat: true,
	total: true,
	currency: true,
	exchangeRate: true,
	text: true,
	note: true,
})
	.extend({
		vat: VatDataSchema,
		total: DecimalTextSchema,
		exchangeRate: DecimalTextSchema.nullable(),
	})
	.strict()
	.meta({
		id: "record-export.InvoiceDataSchema",
		description:
			"Explicit intermediate output fields for invoice; field validation policies are shared with the admitted model.",
	});
export type InvoiceDataSchema = typeof InvoiceDataSchema;
export namespace InvoiceDataSchema {
	export type Type = z.infer<InvoiceDataSchema>;
}
