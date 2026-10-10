import { Data } from "effect";

/** The selected diagnostic file rejected a write. */
export class ProcessingLogError extends Data.TaggedError("ProcessingLogError")<{
	readonly path: string;
	readonly cause: unknown;
}> {
	override get message(): string {
		return `The processing log could not be written to ${this.path}.`;
	}
}
