import { Data } from "effect";
export class RequestRejectedError extends Data.TaggedError("RequestRejectedError")<{
	readonly code: string;
	readonly detail: string;
}> {
	get message(): string {
		return this.detail;
	}
}
