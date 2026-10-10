import { Effect, FileSystem, Path } from "effect";
import { CompanyLockedError } from "../error/CompanyLockedError";
import type { CompanySourceSchema } from "../schema/CompanySourceSchema";

/** A cooperative busy check, not lock acquisition or a consistent source snapshot. */
export const ensureCompanyUnlockedFx = Effect.fn("ensureCompanyUnlockedFx")(function* (
	source: CompanySourceSchema.Type,
) {
	const fileSystem = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const lockPath = path.join(source.directory, "FIRMA.LCK");
	// Conservatively consider even an empty marker busy. Permission and other I/O failures propagate.
	if (yield* fileSystem.exists(lockPath))
		return yield* Effect.fail(
			new CompanyLockedError({
				companyId: source.companyId,
				path: lockPath,
			}),
		);
});
