import { Data } from "effect";
export class AppendEntryError extends Data.TaggedError("AppendEntryError")<{
	readonly path: string;
	readonly cause: unknown;
}> {}
