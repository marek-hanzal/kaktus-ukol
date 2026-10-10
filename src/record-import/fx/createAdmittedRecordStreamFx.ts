import { Effect, Stream } from "effect";
import { validateRecordFx } from "~/accounting-record/fx/validateRecordFx";
import { createIntermediateStreamFx } from "./createIntermediateStreamFx";
import { IntermediateOutputSchema } from "~/record-export/schema/IntermediateOutputSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";

/** Rehydrate only our bounded, validated, operation-local snapshot. */
export const createAdmittedRecordStreamFx = Effect.fnUntraced(function* (path: string) {
	const candidates = yield* createIntermediateStreamFx({
		path,
		maxRecordBytes: 1024 * 1024,
		chunkBytes: 16 * 1024,
	});
	return candidates.pipe(
		Stream.mapEffect(
			(candidate) => parseRecordFx(IntermediateOutputSchema, candidate.value, path),
			{
				concurrency: 1,
			},
		),
		Stream.mapEffect(validateRecordFx, {
			concurrency: 1,
		}),
	);
});
