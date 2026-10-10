import { Data } from "effect";

export class DataPathConflictError extends Data.TaggedError("DataPathConflictError")<{
	readonly input: string;
	readonly conflict: string;
}> {
	override get message(): string {
		return `Input ${this.input} conflicts with a data destination or log ${this.conflict}.`;
	}
}
