import { Data } from "effect";

/** A structural DBF failure; record is the one-based physical slot, including deletions. */
export class DbfFormatError extends Data.TaggedError("DbfFormatError")<{
	readonly path: string;
	readonly offset: number;
	readonly record: number | null;
	readonly detail: string;
}> {
	override get message(): string {
		return `Invalid DBF ${this.path} at byte ${this.offset}${this.record === null ? "" : `, record ${this.record}`}: ${this.detail}`;
	}
}
