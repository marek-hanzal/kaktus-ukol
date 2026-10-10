import { z } from "zod";
import { PhaseEnumSchema } from "./PhaseEnumSchema";
/** One incremental human-log event; diagnostics are independent of the atomic data output. */
export const EventSchema = z
	.object({
		operation: z.string().min(1),
		phase: PhaseEnumSchema,
		message: z.string(),
	})
	.strict()
	.meta({
		id: "processing-log.EventSchema",
		description:
			"One incremental human-log event; diagnostics are independent of the atomic data output.",
	});
export type EventSchema = typeof EventSchema;
export namespace EventSchema {
	export type Type = z.infer<EventSchema>;
}
