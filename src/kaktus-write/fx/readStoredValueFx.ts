import { Effect, Stream } from "effect";
import type { z } from "zod";
import { readIntermediateStream } from "~/record-import/stream/readIntermediateStream";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { WriteError } from "../error/WriteError";
/** Internal state is untrusted input too, with one bounded JSON record. */
export const readStoredValueFx = Effect.fnUntraced(function* <S extends z.ZodType>(
	file: string,
	schema: S,
) {
	const rows = yield* readIntermediateStream({
		path: file,
		maxRecordBytes: 1024 * 1024,
		chunkBytes: 16 * 1024,
	}).pipe(Stream.take(2), Stream.runCollect);
	if (rows.length !== 1)
		return yield* Effect.fail(
			new WriteError({
				detail: `Expected exactly one state record in ${file}`,
			}),
		);
	return yield* parseRecordFx(schema, rows[0]?.value, file);
});
