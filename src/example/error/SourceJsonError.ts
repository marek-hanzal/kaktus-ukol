import { Data } from "effect";

/** JSON framing, encoding or record decoding failed; continuing cannot establish a valid document. */
export class SourceJsonError extends Data.TaggedError("SourceJsonError")<{
	readonly path: string;
	readonly record: number;
	readonly detail: string;
	readonly cause?: unknown;
}> {
	override get message(): string {
		return `Invalid example JSON at ${this.path}, record ${this.record}: ${this.detail}`;
	}
}
