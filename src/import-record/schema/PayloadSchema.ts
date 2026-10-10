import { z } from "zod";

/** Untrusted business fields; missing, null, wrong types and unknown keys reach domain validation. */
export const PayloadSchema = z.record(z.string(), z.unknown()).meta({
	id: "import-record.PayloadSchema",
	description:
		"Untrusted business fields; missing, null, wrong types and unknown keys reach domain validation.",
});
export type PayloadSchema = typeof PayloadSchema;
export namespace PayloadSchema {
	export type Type = z.infer<PayloadSchema>;
}
