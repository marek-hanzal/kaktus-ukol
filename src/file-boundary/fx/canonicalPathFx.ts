import { Effect, FileSystem, Path } from "effect";

/** Resolve existing ancestors too, so a new destination cannot hide behind a directory symlink. */
export const canonicalPathFx = Effect.fnUntraced(function* (input: string) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	let cursor = path.resolve(input);
	const suffix: string[] = [];
	while (true) {
		const resolved = yield* fs.realPath(cursor).pipe(
			Effect.catchIf(
				(error) => error.reason._tag === "NotFound",
				() => Effect.succeed(null),
			),
		);
		if (resolved !== null) return path.join(resolved, ...suffix.reverse());
		const parent = path.dirname(cursor);
		if (parent === cursor) return cursor;
		suffix.push(path.basename(cursor));
		cursor = parent;
	}
});
