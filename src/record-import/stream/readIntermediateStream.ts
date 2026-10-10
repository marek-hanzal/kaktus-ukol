import { Effect, Stream } from "effect";
import { readLinesStream } from "~/ndjson/stream/readLinesStream";
import { parseLineFx } from "~/ndjson/fx/parseLineFx";
import type { ReaderOptionsSchema } from "~/ndjson/schema/ReaderOptionsSchema";
import type { CandidateSchema } from "../schema/CandidateSchema";

/** Native intermediate input; syntax/encoding failures remain adapter errors. */
export const readIntermediateStream = (options: ReaderOptionsSchema.Type) =>
	readLinesStream(options).pipe(
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
