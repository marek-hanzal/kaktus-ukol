import { z } from "zod";
import { DateSchema } from "~/accounting-value/schema/DateSchema";
import { DecimalSchema } from "~/accounting-value/schema/DecimalSchema";
import { CurrencySchema } from "~/accounting-value/schema/CurrencySchema";
import { CompanyIdSchema } from "./CompanyIdSchema";
import { VatTotalsSchema } from "./VatTotalsSchema";
/** Normalized company-scoped received invoice; monetary DBF values remain decimal strings. */
export const InvoiceSchema = z
	.object({
		companyId: CompanyIdSchema,
		id: z.int().nonnegative(),
		documentNumber: z.string().min(1),
		supplierNumber: z.string(),
		variableSymbol: z.string(),
		supplierId: z.int().nonnegative(),
		issuedOn: DateSchema,
		taxableOn: DateSchema.nullable(),
		dueOn: DateSchema.nullable(),
		paidOn: DateSchema.nullable(),
		vat: VatTotalsSchema,
		total: DecimalSchema,
		currency: CurrencySchema,
		exchangeRate: DecimalSchema.nullable(),
		text: z.string(),
		note: z.string(),
	})
	.strict()
	.meta({
		id: "kaktus.InvoiceSchema",
		description:
			"Normalized company-scoped received invoice; monetary DBF values remain decimal strings.",
	});
export type InvoiceSchema = typeof InvoiceSchema;
export namespace InvoiceSchema {
	export type Type = z.infer<InvoiceSchema>;
}
