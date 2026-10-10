import { Data } from "effect";

export class TableMappingError extends Data.TaggedError("TableMappingError")<{
	readonly path: string;
	readonly detail: string;
}> {
	override get message(): string {
		return `Cannot map Kaktus table ${this.path}: ${this.detail}`;
	}
}
