import { Data } from "effect";
import type { SourceSchema } from "../schema/SourceSchema";
import type { FormatEnumSchema } from "../schema/FormatEnumSchema";

/** A complete encoded record exceeds the selected output contract's resource limit. */
export class OutputRecordTooLargeError extends Data.TaggedError("OutputRecordTooLargeError")<{
	readonly format: FormatEnumSchema.Type;
	readonly source: SourceSchema.Type;
	readonly actualBytes: number;
	readonly maxBytes: number;
}> {
	override get message(): string {
		return `Output record ${this.source.location}#${this.source.record} in ${this.format} needs ${this.actualBytes} bytes; limit is ${this.maxBytes}.`;
	}
}
