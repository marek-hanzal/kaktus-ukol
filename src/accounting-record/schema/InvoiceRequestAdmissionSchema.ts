import type { z } from "zod";
import { DecimalInputSchema } from "~/accounting-value/schema/DecimalInputSchema";
import { PositiveDecimalTextSchema } from "~/accounting-value/schema/PositiveDecimalTextSchema";
import { InvoiceRequestSchema } from "./InvoiceRequestSchema";
import { VatBreakdownAdmissionSchema } from "./VatBreakdownAdmissionSchema";

/** Decoded TAXY invoice admission; external number tokens must arrive as exact decimal text. */
export const InvoiceRequestAdmissionSchema = InvoiceRequestSchema.extend({
	vat: VatBreakdownAdmissionSchema,
	total: DecimalInputSchema,
	exchangeRate: PositiveDecimalTextSchema.pipe(DecimalInputSchema)
		.pipe(InvoiceRequestSchema.shape.exchangeRate.unwrap())
		.nullable(),
}).meta({
	id: "accounting-record.InvoiceRequestAdmissionSchema",
	description:
		"Decoded TAXY invoice admission; external number tokens must arrive as exact decimal text.",
});
export type InvoiceRequestAdmissionSchema = typeof InvoiceRequestAdmissionSchema;
export namespace InvoiceRequestAdmissionSchema {
	export type Type = z.infer<InvoiceRequestAdmissionSchema>;
	export type Input = z.input<InvoiceRequestAdmissionSchema>;
}
