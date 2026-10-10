import { Data } from "effect";

export class InvalidEncodingError extends Data.TaggedError("InvalidEncodingError")<{
	readonly path: string;
	readonly line: number;
	readonly cause: unknown;
}> {
	override get message(): string {
		return `Invalid UTF-8 at ${this.path}:${this.line}.`;
	}
}
