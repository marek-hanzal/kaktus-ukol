import { Data } from "effect";

/** An ambiguous or unsupported source selection cannot produce an importable batch. */
export class ExportError extends Data.TaggedError("KaktusExportError")<{
	readonly detail: string;
}> {
	override get message(): string {
		return this.detail;
	}
}
