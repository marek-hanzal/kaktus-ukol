import { Effect, FileSystem, Path } from "effect";
import { AppendEntryError } from "../error/AppendEntryError";

/** One bounded, synchronized append. The capability owning the file serializes callers. */
export const appendEntryFx = Effect.fnUntraced(function* (
	output: string,
	text: string,
	maxBytes = 64 * 1024,
) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const bytes = new TextEncoder().encode(text);
	yield* Effect.scoped(
		Effect.gen(function* () {
			if (bytes.byteLength > maxBytes)
				return yield* Effect.fail(new RangeError(`Log entry exceeds ${maxBytes} bytes.`));
			yield* fs.makeDirectory(path.dirname(output), {
				recursive: true,
			});
			const file = yield* fs.open(output, {
				flag: "a",
			});
			yield* file.writeAll(bytes);
			yield* file.sync;
		}),
	).pipe(
		Effect.mapError(
			(cause) =>
				new AppendEntryError({
					path: output,
					cause,
				}),
		),
	);
});
