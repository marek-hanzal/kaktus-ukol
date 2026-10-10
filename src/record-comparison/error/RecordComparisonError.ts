import { Data } from "effect";
export class RecordComparisonError extends Data.TaggedError("RecordComparisonError")<{
	readonly detail: string;
}> {
	override get message(): string {
		return this.detail;
	}
}
