import type { z } from "zod";
import { DecimalInputSchema } from "~/accounting-value/schema/DecimalInputSchema";
import { InvoiceSchema } from "./InvoiceSchema";
import { VatTotalsAdmissionSchema } from "./VatTotalsAdmissionSchema";

/** Complete invoice admission; all decimal text becomes BigDecimal before entering the domain. */
export const InvoiceAdmissionSchema = InvoiceSchema.extend({
	vat: VatTotalsAdmissionSchema,
	total: DecimalInputSchema,
	exchangeRate: DecimalInputSchema.nullable(),
}).meta({
	id: "accounting-record.InvoiceAdmissionSchema",
	description:
		"Complete invoice admission; all decimal text becomes BigDecimal before entering the domain.",
});
export type InvoiceAdmissionSchema = typeof InvoiceAdmissionSchema;
export namespace InvoiceAdmissionSchema {
	export type Type = z.infer<InvoiceAdmissionSchema>;
	export type Input = z.input<InvoiceAdmissionSchema>;
}
