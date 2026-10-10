import { z } from "zod";
import { EventSchema } from "./EventSchema";
export const EntrySchema = EventSchema.extend({
	timestamp: z.iso.datetime(),
}).meta({
	id: "processing-log.EntrySchema",
});
export type EntrySchema = typeof EntrySchema;
export namespace EntrySchema {
	export type Type = z.infer<EntrySchema>;
}
