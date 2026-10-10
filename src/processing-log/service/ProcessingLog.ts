import { Context, type Effect } from "effect";
import type { EventSchema } from "../schema/EventSchema";
import type { ProcessingLogError } from "../error/ProcessingLogError";

/** Incremental diagnostic capability, selected once by the application host. */
export interface ProcessingLog {
	readonly path: string;
	readonly writeFx: (event: EventSchema.Type) => Effect.Effect<void, ProcessingLogError>;
}
export const ProcessingLog = Context.Service<ProcessingLog>("Kaktus/ProcessingLog");
