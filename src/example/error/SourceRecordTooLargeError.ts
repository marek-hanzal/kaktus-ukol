import { Data } from "effect";

export class SourceRecordTooLargeError extends Data.TaggedError("SourceRecordTooLargeError")<{
	readonly path: string;
	readonly record: number;
	readonly maxBytes: number;
}> {
	override get message(): string {
		return `Example JSON record ${this.record} at ${this.path} exceeds ${this.maxBytes} bytes.`;
	}
}
