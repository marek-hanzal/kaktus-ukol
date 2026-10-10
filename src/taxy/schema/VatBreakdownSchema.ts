import { z } from "zod";
import { VatLineSchema } from "./VatLineSchema";
/** Complete bounded VAT breakdown of one invoice. */
export const VatBreakdownSchema = z.array(VatLineSchema).min(1).max(32).meta({
	id: "taxy.VatBreakdownSchema",
	description: "Complete bounded VAT breakdown of one invoice.",
});
export type VatBreakdownSchema = typeof VatBreakdownSchema;
export namespace VatBreakdownSchema {
	export type Type = z.infer<VatBreakdownSchema>;
}
