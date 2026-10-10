import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/cli";
import { readExampleFx } from "~/example/fx/readExampleFx";
import type { ReadOptionsSchema } from "~/example/schema/ReadOptionsSchema";
import { formatImportSummaryFn } from "~/record-import/fn/formatImportSummaryFn";

const runConvertExampleCommandFx = Effect.fn("runConvertExampleCommandFx")(function* (
	options: ReadOptionsSchema.Type,
) {
	yield* Console.log(formatImportSummaryFn(yield* readExampleFx(options)));
});

export const ConvertExampleCommand = Command.make(
	"convert",
	{
		input: Argument.String("json-directory"),
		output: Flag.String("output").pipe(Flag.withDefault(".out/example.ndjson")),
		actor: Flag.String("actor").pipe(
			Flag.withDescription("Caller-declared identity for the audit log."),
		),
		maxRecordBytes: Flag.Int("max-record-bytes").pipe(
			Flag.withDefault(64 * 1024),
			Flag.withDescription(
				"Maximum UTF-8 bytes per JSON value, excluding document framing; at most 1 MiB.",
			),
		),
		maxOutputRecordBytes: Flag.Int("max-output-record-bytes").pipe(
			Flag.withDefault(64 * 1024),
			Flag.withDescription(
				"Maximum UTF-8 bytes per exported record, excluding LF; at most 1 MiB.",
			),
		),
	},
	runConvertExampleCommandFx,
).pipe(
	Command.withDescription(
		"Stream klienti.json and doklady-k-zapisu.json into validated intermediate NDJSON.",
	),
);
