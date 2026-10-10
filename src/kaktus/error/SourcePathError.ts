import { Data } from "effect";

export class SourcePathError extends Data.TaggedError("SourcePathError")<{
	readonly root: string;
	readonly path: string;
}> {
	override get message(): string {
		return `Kaktus source ${this.path} escapes DATA directory ${this.root}`;
	}
}
