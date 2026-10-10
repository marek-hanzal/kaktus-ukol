import type { z } from "zod";
import { DecimalInputSchema } from "~/accounting-value/schema/DecimalInputSchema";
import { VatTotalsSchema } from "./VatTotalsSchema";

/** Strict VAT text input, producing exact internal decimal values. */
export const VatTotalsAdmissionSchema = VatTotalsSchema.extend({
	base0: DecimalInputSchema,
	base12: DecimalInputSchema,
	vat12: DecimalInputSchema,
	base21: DecimalInputSchema,
	vat21: DecimalInputSchema,
}).meta({
	id: "accounting-record.VatTotalsAdmissionSchema",
	description: "Strict VAT text input, producing exact internal decimal values.",
});
export type VatTotalsAdmissionSchema = typeof VatTotalsAdmissionSchema;
export namespace VatTotalsAdmissionSchema {
	export type Type = z.infer<VatTotalsAdmissionSchema>;
	export type Input = z.input<VatTotalsAdmissionSchema>;
}
