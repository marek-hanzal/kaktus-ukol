import { Effect, Stream } from "effect";
import { createLinesStreamFx } from "~/ndjson/fx/createLinesStreamFx";
import { parseLineFx } from "~/ndjson/fx/parseLineFx";
import type { ReaderOptionsSchema } from "~/ndjson/schema/ReaderOptionsSchema";
import type { CandidateSchema } from "../schema/CandidateSchema";

/** Native intermediate input; syntax/encoding failures remain adapter errors. */
export const createIntermediateStreamFx = Effect.fnUntraced(function* (
	options: ReaderOptionsSchema.Type,
) {
	const lines = yield* createLinesStreamFx(options);
	return lines.pipe(
		Stream.filter((line) => line.text.trim().length > 0),
		Stream.mapEffect(
			(line) =>
				parseLineFx(line, options.path).pipe(
					Effect.map(
						(value) =>
							({
								input: options.path,
								position: line.number,
								value,
							}) satisfies CandidateSchema.Type,
					),
				),
			{
				concurrency: 1,
			},
		),
	);
});
