import { z } from "zod";

/** Caller-declared local identity; this is not authentication. */
export const ActorSchema = z.string().trim().min(1).max(256).meta({
	id: "audit-log.ActorSchema",
});
export type ActorSchema = typeof ActorSchema;
export namespace ActorSchema {
	export type Type = z.infer<ActorSchema>;
}
