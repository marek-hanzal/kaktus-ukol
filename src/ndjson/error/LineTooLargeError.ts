import { Data } from "effect";

/** Raised before a physical input line can exceed the configured buffer. */
export class LineTooLargeError extends Data.TaggedError("LineTooLargeError")<{
	readonly path: string;
	readonly line: number;
	readonly maxBytes: number;
}> {
	override get message(): string {
		return `Line ${this.line} in ${this.path} exceeds ${this.maxBytes} bytes.`;
	}
}
