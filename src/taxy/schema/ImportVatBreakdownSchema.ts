import { z } from "zod";
import { ImportVatLineSchema } from "./ImportVatLineSchema";
/** Per-invoice VAT rows, bounded independently of the total invoice count. */
export const ImportVatBreakdownSchema = z.array(ImportVatLineSchema).max(32).meta({
	id: "taxy.ImportVatBreakdownSchema",
	description: "Per-invoice VAT rows, bounded independently of the total invoice count.",
});
export type ImportVatBreakdownSchema = typeof ImportVatBreakdownSchema;
export namespace ImportVatBreakdownSchema {
	export type Type = z.infer<ImportVatBreakdownSchema>;
}
