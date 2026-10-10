import { Flag } from "effect/cli";

export const BestEffortFlag = Flag.Boolean("best-effort").pipe(
	Flag.withDefault(false),
	Flag.withDescription(
		"Omit rejected records; you must review the processing log. Framing, I/O and lock failures still abort.",
	),
);
