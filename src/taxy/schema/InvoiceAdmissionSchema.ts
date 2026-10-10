import type { z } from "zod";
import { DecimalInputSchema } from "~/accounting-value/schema/DecimalInputSchema";
import { InvoiceSchema } from "./InvoiceSchema";
import { VatBreakdownAdmissionSchema } from "./VatBreakdownAdmissionSchema";

/** Decoded TAXY invoice admission; external number tokens must arrive as exact decimal text. */
export const InvoiceAdmissionSchema = InvoiceSchema.extend({
	vat: VatBreakdownAdmissionSchema,
	total: DecimalInputSchema,
	exchangeRate: DecimalInputSchema.pipe(InvoiceSchema.shape.exchangeRate.unwrap()).nullable(),
}).meta({
	id: "taxy.InvoiceAdmissionSchema",
	description:
		"Decoded TAXY invoice admission; external number tokens must arrive as exact decimal text.",
});
export type InvoiceAdmissionSchema = typeof InvoiceAdmissionSchema;
export namespace InvoiceAdmissionSchema {
	export type Type = z.infer<InvoiceAdmissionSchema>;
	export type Input = z.input<InvoiceAdmissionSchema>;
}
