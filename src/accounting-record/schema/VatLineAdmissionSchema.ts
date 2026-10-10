import type { z } from "zod";
import { DecimalInputSchema } from "~/accounting-value/schema/DecimalInputSchema";
import { VatLineSchema } from "./VatLineSchema";

/** Strict decoded TAXY VAT input; monetary text is admitted as BigDecimal. */
export const VatLineAdmissionSchema = VatLineSchema.extend({
	base: DecimalInputSchema,
	tax: DecimalInputSchema,
}).meta({
	id: "accounting-record.VatLineAdmissionSchema",
	description: "Strict decoded TAXY VAT input; monetary text is admitted as BigDecimal.",
});
export type VatLineAdmissionSchema = typeof VatLineAdmissionSchema;
export namespace VatLineAdmissionSchema {
	export type Type = z.infer<VatLineAdmissionSchema>;
	export type Input = z.input<VatLineAdmissionSchema>;
}
