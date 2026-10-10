import { Effect, Stream } from "effect";
import { createIntermediateStreamFx } from "~/record-import/fx/createIntermediateStreamFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { PlanSchema } from "../schema/PlanSchema";

export const createPlanStreamFx = Effect.fnUntraced(function* (file: string) {
	const candidates = yield* createIntermediateStreamFx({
		path: file,
		maxRecordBytes: 1024 * 1024,
		chunkBytes: 16 * 1024,
	});
	return candidates.pipe(
		Stream.mapEffect((candidate) => parseRecordFx(PlanSchema, candidate.value, file), {
			concurrency: 1,
		}),
	);
});
