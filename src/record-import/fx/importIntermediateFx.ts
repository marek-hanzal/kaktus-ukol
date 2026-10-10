import { Effect, Path, Stream } from "effect";
import { runAuditedFx } from "~/audit-log/fx/runAuditedFx";
import { checkDataPathsFx } from "~/file-boundary/fx/checkDataPathsFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { ImportOptionsSchema } from "../schema/ImportOptionsSchema";
import { formatBatchSummaryFn } from "~/record-validation/fn/formatBatchSummaryFn";
import { createIntermediateStreamFx } from "./createIntermediateStreamFx";
import { importRecordsFx } from "./importRecordsFx";

/** Select the native intermediate adapter; validation is shared by every source adapter. */
export const importIntermediateFx = Effect.fn("importIntermediateFx")(function* (
	inputOptions: ImportOptionsSchema.Type,
) {
	const options = yield* parseRecordFx(
		ImportOptionsSchema,
		inputOptions,
		"intermediate import options",
	);
	const path = yield* Path.Path;
	const input = path.resolve(options.input);
	const output = path.resolve(options.output);
	yield* checkDataPathsFx(
		[
			input,
		],
		output,
	);
	const audited = yield* runAuditedFx(
		{
			actor: options.actor,
			bestEffort: options.bestEffort,
			action: "import_intermediate",
			inputs: [
				input,
			],
			output,
		},
		importRecordsFx({
			bestEffort: options.bestEffort,
			records: Stream.unwrap(
				createIntermediateStreamFx({
					path: input,
					maxRecordBytes: options.maxRecordBytes,
					chunkBytes: 16 * 1024,
				}),
			),
			publication: {
				output,
				maxChunkBytes: options.maxOutputRecordBytes + 1,
			},
			exportOptions: {
				format: options.outputFormat,
				maxRecordBytes: options.maxOutputRecordBytes,
			},
		}),
		formatBatchSummaryFn,
	);
	return {
		...audited.result,
		audit: audited.audit,
	};
});
