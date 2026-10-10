import { Effect, Path } from "effect";
import { AuditLog } from "~/audit-log/service/AuditLog";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";
import { DataPathConflictError } from "../error/DataPathConflictError";
import { canonicalPathFx } from "./canonicalPathFx";

/** Protect inputs and both append-only logs from publication and logging aliases. */
export const checkDataPathsFx = Effect.fn("checkDataPathsFx")(function* (
	inputs: readonly string[],
	output: string,
	directory = false,
) {
	const path = yield* Path.Path;
	const log = yield* ProcessingLog;
	const audit = yield* AuditLog;
	const destinations = [
		output,
		log.path,
		audit.path,
	];
	const canonical: string[] = [];
	for (const destination of destinations)
		canonical.push((yield* canonicalPathFx(destination)).toLowerCase());
	if (new Set(canonical).size !== canonical.length)
		return yield* Effect.fail(
			new DataPathConflictError({
				input: output,
				conflict: "output, processing log and audit must be distinct",
			}),
		);
	for (const input of inputs) {
		const source = (yield* canonicalPathFx(input)).toLowerCase();
		for (const destination of canonical) {
			const relative = path.relative(source, destination);
			const inside =
				directory &&
				relative !== ".." &&
				!relative.startsWith(`..${path.sep}`) &&
				!path.isAbsolute(relative);
			if (source === destination || inside)
				return yield* Effect.fail(
					new DataPathConflictError({
						input,
						conflict: destination,
					}),
				);
		}
	}
});
