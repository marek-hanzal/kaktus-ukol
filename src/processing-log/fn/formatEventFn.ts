import type { EventSchema } from "../schema/EventSchema";

/** One physical log line per event, even when untrusted text contains newlines. */
export const formatEventFn = (event: EventSchema.Type): string =>
	`[${event.phase}] ${event.operation}: ${event.message}`.replace(/[\r\n\u2028\u2029]/g, " ");
