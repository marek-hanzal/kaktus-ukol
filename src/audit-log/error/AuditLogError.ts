import { Data } from "effect";
export class AuditLogError extends Data.TaggedError("AuditLogError")<{
	readonly path: string;
	readonly cause: unknown;
}> {
	override get message(): string {
		return `Audit write failed: ${this.path}.`;
	}
}
