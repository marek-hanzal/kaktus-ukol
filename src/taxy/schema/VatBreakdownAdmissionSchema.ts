import { z } from "zod";
import { VatLineAdmissionSchema } from "./VatLineAdmissionSchema";

/** Complete bounded TAXY VAT input with exact decimal admission. */
export const VatBreakdownAdmissionSchema = z.array(VatLineAdmissionSchema).min(1).max(32).meta({
	id: "taxy.VatBreakdownAdmissionSchema",
	description: "Complete bounded TAXY VAT input with exact decimal admission.",
});
export type VatBreakdownAdmissionSchema = typeof VatBreakdownAdmissionSchema;
export namespace VatBreakdownAdmissionSchema {
	export type Type = z.infer<VatBreakdownAdmissionSchema>;
	export type Input = z.input<VatBreakdownAdmissionSchema>;
}
