import { Effect, Stream } from "effect";
import { createIntermediateStreamFx } from "~/record-import/fx/createIntermediateStreamFx";
import { RecordComparisonError } from "../error/RecordComparisonError";

/** Bound input to one business record. Never collect or join a dataset to compare two records. */
export const readSingleRecordFx = Effect.fn("readSingleRecordFx")(function* (
	path: string,
	maxRecordBytes: number,
) {
	const records = yield* Stream.unwrap(
		createIntermediateStreamFx({
			path,
			maxRecordBytes,
			chunkBytes: 16 * 1024,
		}),
	).pipe(Stream.take(2), Stream.runCollect);
	if (records.length !== 1)
		return yield* Effect.fail(
			new RecordComparisonError({
				detail: `${path}: expected exactly one nonblank intermediate record.`,
			}),
		);
	const record = records[0];
	if (record === undefined)
		return yield* Effect.fail(
			new RecordComparisonError({
				detail: `${path}: record unavailable.`,
			}),
		);
	return record.value;
});
