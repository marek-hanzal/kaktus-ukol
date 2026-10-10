import type { z } from "zod";
import { ClientSchema } from "~/accounting-record/schema/ClientSchema";

/** Explicit public fields and shared value policies for Client. */
export const ClientDataSchema = ClientSchema.pick({
	id: true,
	name: true,
	registrationNumber: true,
})
	.strict()
	.meta({
		id: "record-export.ClientDataSchema",
		description: "Explicit public fields and shared value policies for Client.",
	});
export type ClientDataSchema = typeof ClientDataSchema;
export namespace ClientDataSchema {
	export type Type = z.infer<ClientDataSchema>;
}
