import { Argument, Command, Flag } from "effect/cli";
import { Console, Effect } from "effect";
import { importIntermediateFx } from "~/record-import/fx/importIntermediateFx";
import type { ImportOptionsSchema } from "~/record-import/schema/ImportOptionsSchema";

const runImportIntermediateCommandFx = Effect.fn("runImportIntermediateCommandFx")(function* (
	options: ImportOptionsSchema.Type,
) {
	const summary = yield* importIntermediateFx(options);
	yield* Console.log(JSON.stringify(summary));
});

/** Intermediate NDJSON is a supported input in its own right. */
export const ImportIntermediateCommand = Command.make(
	"import-intermediate",
	{
		input: Argument.String("input"),
		output: Flag.String("output").pipe(Flag.withDefault(".out/import.ndjson")),
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
		"Validate intermediate NDJSON and atomically publish complete accounting records.",
	),
);
