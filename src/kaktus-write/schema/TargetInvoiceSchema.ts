import { z } from "zod";
import { DateSchema } from "~/accounting-value/schema/DateSchema";
import { DecimalTextSchema } from "~/accounting-value/schema/DecimalTextSchema";
import { CurrencySchema } from "~/accounting-value/schema/CurrencySchema";

/** Only invoice properties persisted by the import protocol; identity is indexed separately. */
export const TargetInvoiceSchema = z
	.object({
		supplierNumber: z.string(),
		variableSymbol: z.string(),
		issuedOn: DateSchema,
		taxableOn: DateSchema.nullable(),
		dueOn: DateSchema.nullable(),
		base0: DecimalTextSchema,
		base12: DecimalTextSchema,
		vat12: DecimalTextSchema,
		base21: DecimalTextSchema,
		vat21: DecimalTextSchema,
		total: DecimalTextSchema,
		currency: CurrencySchema,
		exchangeRate: DecimalTextSchema.nullable(),
		text: z.string(),
		note: z.string(),
	})
	.strict()
	.meta({
		id: "kaktus-write.TargetInvoiceSchema",
	});
export type TargetInvoiceSchema = typeof TargetInvoiceSchema;
export namespace TargetInvoiceSchema {
	export type Type = z.infer<TargetInvoiceSchema>;
}
