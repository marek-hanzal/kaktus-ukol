import { Data } from "effect";

/** A producer violated the configured bounded-chunk contract. */
export class ChunkTooLargeError extends Data.TaggedError("ChunkTooLargeError")<{
	readonly actualBytes: number;
	readonly maxBytes: number;
}> {
	override get message(): string {
		return `Stream chunk has ${this.actualBytes} bytes; maximum is ${this.maxBytes}.`;
	}
}
