import { Data } from "effect";

export class InvalidJsonError extends Data.TaggedError("InvalidJsonError")<{
	readonly path: string;
	readonly line: number;
	readonly cause: unknown;
}> {
	override get message(): string {
		return `Invalid JSON at ${this.path}:${this.line}.`;
	}
}
