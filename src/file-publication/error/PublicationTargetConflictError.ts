import { Data } from "effect";

/** Data output must never replace or be appended to by its own diagnostic log. */
export class PublicationTargetConflictError extends Data.TaggedError(
	"PublicationTargetConflictError",
)<{
	readonly path: string;
}> {
	override get message(): string {
		return `The publication destination conflicts with the processing log: ${this.path}`;
	}
}
