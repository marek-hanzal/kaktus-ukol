import { Data } from "effect";

export class InputPathConflictError extends Data.TaggedError("InputPathConflictError")<{
	readonly input: string;
	readonly conflict: string;
}> {
	override get message(): string {
		return `Input ${this.input} conflicts with output or log ${this.conflict}.`;
	}
}
