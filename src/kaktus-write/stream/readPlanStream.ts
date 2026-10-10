import { Stream } from "effect";
import { readIntermediateStream } from "~/record-import/stream/readIntermediateStream";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { PlanSchema } from "../schema/PlanSchema";

export const readPlanStream = (file: string) =>
	readIntermediateStream({
		path: file,
		maxRecordBytes: 1024 * 1024,
		chunkBytes: 16 * 1024,
	}).pipe(
		Stream.mapEffect((candidate) => parseRecordFx(PlanSchema, candidate.value, file), {
			concurrency: 1,
		}),
	);
