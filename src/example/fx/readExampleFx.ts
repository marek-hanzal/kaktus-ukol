import { Effect, Path } from "effect";
import { runAuditedFx } from "~/audit-log/fx/runAuditedFx";
import { ActionEnumSchema } from "~/audit-log/schema/ActionEnumSchema";
import { checkDataPathsFx } from "~/file-boundary/fx/checkDataPathsFx";
import { importRecordsFx } from "~/record-import/fx/importRecordsFx";
import { FormatEnumSchema } from "~/record-export/schema/FormatEnumSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { formatBatchSummaryFn } from "~/record-validation/fn/formatBatchSummaryFn";
import { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { readExampleStream } from "../stream/readExampleStream";

/** Audit before reading the supplied JSON, then validate and atomically publish the common format. */
export const readExampleFx = Effect.fn("readExampleFx")(function* (
	inputOptions: ReadOptionsSchema.Type,
) {
	const options = yield* parseRecordFx(ReadOptionsSchema, inputOptions, "example read options");
	const path = yield* Path.Path;
	const input = path.resolve(options.input);
	const output = path.resolve(options.output);
	yield* checkDataPathsFx(
		[
			input,
		],
		output,
		true,
	);
	// Check physical input aliases too: a source file can be a symlink outside its directory.
	const inputs = [
		path.join(input, "klienti.json"),
		path.join(input, "doklady-k-zapisu.json"),
	];
	yield* checkDataPathsFx(inputs, output);
	const audited = yield* runAuditedFx(
		{
			actor: options.actor,
			bestEffort: options.bestEffort,
			action: ActionEnumSchema.enum.read_example,
			inputs,
			output,
		},
		importRecordsFx({
			bestEffort: options.bestEffort,
			records: readExampleStream({
				...options,
				input,
				output,
			}),
			publication: {
				output,
				maxChunkBytes: options.maxOutputRecordBytes + 1,
			},
			exportOptions: {
				format: FormatEnumSchema.enum.intermediate,
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
