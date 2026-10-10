import { z } from "zod";
export const ReceiptSchema = z
	.object({
		path: z.string().min(1),
		operationId: z.uuid(),
		completion: z.enum([
			"recorded",
			"unconfirmed",
		]),
	})
	.strict()
	.meta({
		id: "audit-log.ReceiptSchema",
	});
export type ReceiptSchema = typeof ReceiptSchema;
export namespace ReceiptSchema {
	export type Type = z.infer<ReceiptSchema>;
}
