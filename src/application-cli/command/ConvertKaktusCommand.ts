import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/cli";
import { EncodingEnumSchema } from "~/dbf/schema/EncodingEnumSchema";
import { readKaktusFx } from "~/kaktus/fx/readKaktusFx";
import type { ReadOptionsSchema } from "~/kaktus/schema/ReadOptionsSchema";
import { formatImportSummaryFn } from "~/record-import/fn/formatImportSummaryFn";
import { BestEffortFlag } from "../flag/BestEffortFlag";

const runConvertKaktusCommandFx = Effect.fn("runConvertKaktusCommandFx")(function* (
	options: ReadOptionsSchema.Type,
) {
	const receipt = yield* readKaktusFx(options);
	yield* Console.log(formatImportSummaryFn(receipt));
});

export const ConvertKaktusCommand = Command.make(
	"convert",
	{
		input: Argument.String("data-directory"),
		bestEffort: BestEffortFlag,
		output: Flag.String("output").pipe(Flag.withDefault(".out/kaktus.ndjson")),
		actor: Flag.String("actor").pipe(
			Flag.withDescription("Caller-declared identity for the audit log."),
		),
		encoding: Flag.ChoiceWithValue(
			"encoding",
			EncodingEnumSchema.options.map((value) => [
				value,
				value,
			]),
		).pipe(Flag.withDefault(EncodingEnumSchema.enum.auto)),
		maxRecordBytes: Flag.Int("max-record-bytes").pipe(
			Flag.withDefault(64 * 1024),
			Flag.withDescription("Maximum physical DBF record bytes, including deletion marker."),
		),
		maxOutputRecordBytes: Flag.Int("max-output-record-bytes").pipe(
			Flag.withDefault(64 * 1024),
			Flag.withDescription(
				"Maximum UTF-8 bytes per exported record, excluding LF; at most 1 MiB.",
			),
		),
	},
	runConvertKaktusCommandFx,
).pipe(
	Command.withDescription(
		"Stream Kaktus DBF tables into a validated intermediate NDJSON export.",
	),
);
