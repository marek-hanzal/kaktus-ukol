import type { z } from "zod";
import { InvoiceRequestSchema } from "~/accounting-record/schema/InvoiceRequestSchema";
import { DecimalTextSchema } from "~/accounting-value/schema/DecimalTextSchema";
import { PositiveDecimalTextSchema } from "~/accounting-value/schema/PositiveDecimalTextSchema";
import { InvoiceSupplierDataSchema } from "./InvoiceSupplierDataSchema";
import { InvoiceBuyerDataSchema } from "./InvoiceBuyerDataSchema";
import { VatLineDataSchema } from "./VatLineDataSchema";

/** Explicit public fields and shared value policies for InvoiceRequest. */
export const InvoiceRequestDataSchema = InvoiceRequestSchema.pick({
	id: true,
	clientId: true,
	type: true,
	status: true,
	number: true,
	variableSymbol: true,
	supplier: true,
	buyer: true,
	issuedOn: true,
	taxableOn: true,
	dueOn: true,
	vat: true,
	total: true,
	currency: true,
	exchangeRate: true,
	description: true,
})
	.extend({
		supplier: InvoiceSupplierDataSchema,
		buyer: InvoiceBuyerDataSchema,
		vat: VatLineDataSchema.array().min(1).max(32),
		total: DecimalTextSchema,
		exchangeRate: PositiveDecimalTextSchema.nullable(),
	})
	.strict()
	.meta({
		id: "record-export.InvoiceRequestDataSchema",
		description: "Explicit public fields and shared value policies for InvoiceRequest.",
	});
export type InvoiceRequestDataSchema = typeof InvoiceRequestDataSchema;
export namespace InvoiceRequestDataSchema {
	export type Type = z.infer<InvoiceRequestDataSchema>;
}
