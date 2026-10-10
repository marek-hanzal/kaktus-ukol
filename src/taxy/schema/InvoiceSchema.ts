import { z } from "zod";
import { IdSchema } from "~/accounting-value/schema/IdSchema";
import { DateSchema } from "~/accounting-value/schema/DateSchema";
import { CurrencySchema } from "~/accounting-value/schema/CurrencySchema";
import { SupplierSchema } from "./SupplierSchema";
import { BuyerSchema } from "./BuyerSchema";
import { InvoiceTypeEnumSchema } from "./InvoiceTypeEnumSchema";
import { InvoiceStatusEnumSchema } from "./InvoiceStatusEnumSchema";
import { VatBreakdownSchema } from "./VatBreakdownSchema";
/** Complete TAXY invoice structure; company authorization, exact totals and period admission remain mandatory. */
export const InvoiceSchema = z
	.object({
		id: IdSchema,
		clientId: z.int().positive(),
		type: InvoiceTypeEnumSchema,
		status: InvoiceStatusEnumSchema,
		number: z.string().min(1),
		variableSymbol: z.string(),
		supplier: SupplierSchema,
		buyer: BuyerSchema,
		issuedOn: DateSchema,
		taxableOn: DateSchema,
		dueOn: DateSchema,
		vat: VatBreakdownSchema,
		total: z.number(),
		currency: CurrencySchema,
		exchangeRate: z.number().positive().nullable(),
		description: z.string(),
	})
	.strict()
	.meta({
		id: "taxy.InvoiceSchema",
		description:
			"Complete TAXY invoice structure; company authorization, exact totals and period admission remain mandatory.",
	});
export type InvoiceSchema = typeof InvoiceSchema;
export namespace InvoiceSchema {
	export type Type = z.infer<InvoiceSchema>;
}
