import { Data } from "effect";
import type { z } from "zod";

/** Expected rejection at a specific external or domain schema boundary. */
export class RecordValidationError extends Data.TaggedError("RecordValidationError")<{
	readonly schemaId: string;
	readonly source: string;
	readonly issues: readonly z.core.$ZodIssue[];
}> {
	override get message(): string {
		return `Invalid ${this.schemaId} at ${this.source}: ${this.issues.map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`).join("; ")}`;
	}
}
