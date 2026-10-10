import type { EntrySchema } from "../schema/EntrySchema";
import { escapeLineFn } from "~/text-output/fn/escapeLineFn";
/** Stable human-readable audit line; a future JSON printer can consume the same entry. */
export const formatEntryFn = (entry: EntrySchema.Type): string =>
	[
		`${entry.timestamp} [${entry.phase}] ${entry.action}`,
		`operation=${entry.operationId}`,
		`actor=${escapeLineFn(entry.actor)}`,
		`inputs=${entry.inputs.map(escapeLineFn).join("; ")}`,
		`output=${escapeLineFn(entry.output)}`,
		escapeLineFn(entry.detail),
	].join(" | ");
