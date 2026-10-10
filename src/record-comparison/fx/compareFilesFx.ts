import { Effect, Path, Stream } from "effect";
import { validateRecordFx } from "~/accounting-record/fx/validateRecordFx";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { runAuditedFx } from "~/audit-log/fx/runAuditedFx";
import { checkDataPathsFx } from "~/file-boundary/fx/checkDataPathsFx";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { ComparisonOptionsSchema } from "../schema/ComparisonOptionsSchema";
import { formatDifferenceFn } from "../fn/formatDifferenceFn";
import { readSingleRecordFx } from "./readSingleRecordFx";
import { compareRecordsFx } from "./compareRecordsFx";

export const compareFilesFx = Effect.fn("compareFilesFx")(function* (
	input: ComparisonOptionsSchema.Type,
) {
	const options = yield* parseRecordFx(ComparisonOptionsSchema, input, "comparison options");
	const path = yield* Path.Path;
	const currentPath = path.resolve(options.current);
	const incomingPath = path.resolve(options.incoming);
	const output = path.resolve(options.output);
	yield* checkDataPathsFx(
		[
			currentPath,
			incomingPath,
		],
		output,
	);
	const audited = yield* runAuditedFx(
		{
			actor: options.actor,
			action: "compare_record",
			inputs: [
				currentPath,
				incomingPath,
			],
			output,
		},
		Effect.gen(function* () {
			const current = yield* validateRecordFx(
				yield* parseRecordFx(
					IntermediateRecordSchema,
					yield* readSingleRecordFx(currentPath, options.maxRecordBytes),
					"current intermediate record",
				),
			);
			const incoming = yield* readSingleRecordFx(incomingPath, options.maxRecordBytes);
			const difference = yield* compareRecordsFx(current, incoming);
			// Bounded chunks even when a configured record contains a long text property.
			const content = Stream.fromIterable(formatDifferenceFn(difference)).pipe(
				Stream.map((line) => `${line}\n`),
				Stream.encodeText,
				Stream.flatMap((bytes) =>
					Stream.fromIterable(
						(function* () {
							for (let offset = 0; offset < bytes.byteLength; offset += 16 * 1024)
								yield bytes.subarray(offset, offset + 16 * 1024);
						})(),
					),
				),
			);
			const publication = yield* publishFileFx({
				content,
				options: {
					output,
					maxChunkBytes: 64 * 1024,
				},
			});
			return {
				difference,
				publication,
			};
		}),
	);
	return {
		...audited.result,
		audit: audited.audit,
	};
});
