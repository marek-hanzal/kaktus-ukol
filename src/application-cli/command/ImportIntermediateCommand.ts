import { Argument, Command, Flag } from "effect/cli";
import { Console, Effect } from "effect";
import { formatImportSummaryFn } from "~/record-import/fn/formatImportSummaryFn";
import { importIntermediateFx } from "~/record-import/fx/importIntermediateFx";
import type { ImportOptionsSchema } from "~/record-import/schema/ImportOptionsSchema";
import { FormatEnumSchema } from "~/record-export/schema/FormatEnumSchema";
import { BestEffortFlag } from "../flag/BestEffortFlag";

const runImportIntermediateCommandFx = Effect.fn("runImportIntermediateCommandFx")(function* (
	options: ImportOptionsSchema.Type,
) {
	const summary = yield* importIntermediateFx(options);
	yield* Console.log(formatImportSummaryFn(summary));
});

/** Intermediate NDJSON is a supported input in its own right. */
export const ImportIntermediateCommand = Command.make(
	"import-intermediate",
	{
		input: Argument.String("input"),
		bestEffort: BestEffortFlag,
		actor: Flag.String("actor").pipe(
			Flag.withDescription("Caller-declared identity for the audit log."),
		),
		output: Flag.String("output").pipe(Flag.withDefault(".out/import.ndjson")),
		outputFormat: Flag.ChoiceWithValue("output-format", [
			[
				FormatEnumSchema.enum.intermediate,
				FormatEnumSchema.enum.intermediate,
			],
		]).pipe(Flag.withDefault(FormatEnumSchema.enum.intermediate)),
		maxOutputRecordBytes: Flag.Int("max-output-record-bytes").pipe(
			Flag.withDefault(64 * 1024),
			Flag.withDescription(
				"Maximum UTF-8 bytes per exported record, excluding LF; at most 1 MiB.",
			),
		),
		maxRecordBytes: Flag.Int("max-record-bytes").pipe(
			Flag.withDefault(64 * 1024),
			Flag.withDescription(
				"Maximum bytes per physical line, before decoding; at most 1 MiB.",
			),
		),
	},
	runImportIntermediateCommandFx,
).pipe(
	Command.withDescription(
		"Validate intermediate NDJSON and atomically publish the selected public output format.",
	),
);
