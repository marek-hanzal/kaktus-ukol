import { Data } from "effect";

/** A complete scan found rejected records; staged valid data was not published. */
export class ImportRejectedError extends Data.TaggedError("ImportRejectedError")<{
	readonly accepted: number;
	readonly rejected: number;
	readonly log: string;
}> {
	override get message(): string {
		return `Import rejected: ${this.rejected} invalid records, ${this.accepted} valid records. No output published. See ${this.log}.`;
	}
}
