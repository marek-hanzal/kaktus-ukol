import type { EntrySchema } from "../schema/EntrySchema";
import { escapeLineFn } from "~/text-output/fn/escapeLineFn";
/** The canonical entry is independent of this human text printer. */
export const formatEventFn = (entry: EntrySchema.Type): string =>
	`${entry.timestamp} [${entry.phase}] ${escapeLineFn(entry.operation)}: ${escapeLineFn(entry.message)}`;
