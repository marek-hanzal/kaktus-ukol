import { Data } from "effect";
export class WriteError extends Data.TaggedError("KaktusWriteError")<{
	readonly detail: string;
}> {
	get message(): string {
		return this.detail;
	}
}
