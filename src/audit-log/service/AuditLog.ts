import { Context, type Effect } from "effect";
import type { EntrySchema } from "../schema/EntrySchema";
import type { AuditLogError } from "../error/AuditLogError";
export interface AuditLog {
	readonly path: string;
	readonly writeFx: (entry: EntrySchema.Type) => Effect.Effect<void, AuditLogError>;
}
export const AuditLog = Context.Service<AuditLog>("Kaktus/AuditLog");
