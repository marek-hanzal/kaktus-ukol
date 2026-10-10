import { BigDecimal } from "effect";
import { z } from "zod";
import { IdSchema } from "~/accounting-value/schema/IdSchema";
import { DateSchema } from "~/accounting-value/schema/DateSchema";
import { CurrencySchema } from "~/accounting-value/schema/CurrencySchema";
import { DecimalSchema } from "~/accounting-value/schema/DecimalSchema";
import { InvoiceSupplierSchema } from "./InvoiceSupplierSchema";
import { InvoiceBuyerSchema } from "./InvoiceBuyerSchema";
import { InvoiceTypeEnumSchema } from "./InvoiceTypeEnumSchema";
import { InvoiceStatusEnumSchema } from "./InvoiceStatusEnumSchema";
import { VatBreakdownSchema } from "./VatBreakdownSchema";
/** Admitted TAXY invoice with BigDecimal amounts; authorization, totals and period checks remain mandatory. */
export const InvoiceRequestSchema = z
	.object({
		id: IdSchema,
		clientId: z.int().positive(),
		type: InvoiceTypeEnumSchema,
		status: InvoiceStatusEnumSchema,
		number: z.string().min(1),
		variableSymbol: z.string(),
		supplier: InvoiceSupplierSchema,
		buyer: InvoiceBuyerSchema,
		issuedOn: DateSchema,
		taxableOn: DateSchema,
		dueOn: DateSchema,
		vat: VatBreakdownSchema,
		total: DecimalSchema,
		currency: CurrencySchema,
		exchangeRate: DecimalSchema.refine(BigDecimal.isPositive, {
			message: "Exchange rate must be positive",
		}).nullable(),
		description: z.string(),
	})
	.strict()
	.meta({
		id: "accounting-record.InvoiceRequestSchema",
		description:
			"Admitted TAXY invoice with BigDecimal amounts; authorization, totals and period checks remain mandatory.",
	});
export type InvoiceRequestSchema = typeof InvoiceRequestSchema;
export namespace InvoiceRequestSchema {
	export type Type = z.infer<InvoiceRequestSchema>;
}
