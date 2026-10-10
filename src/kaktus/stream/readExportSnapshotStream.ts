import { Stream } from "effect";
import { validateRecordFx } from "~/accounting-record/fx/validateRecordFx";
import { readIntermediateStream } from "~/record-import/stream/readIntermediateStream";
import { IntermediateOutputSchema } from "~/record-export/schema/IntermediateOutputSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";

/** Rehydrate only our bounded, validated, operation-local snapshot. */
export const readExportSnapshotStream = (path: string) =>
	readIntermediateStream({
		path,
		maxRecordBytes: 1024 * 1024,
		chunkBytes: 16 * 1024,
	}).pipe(
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
