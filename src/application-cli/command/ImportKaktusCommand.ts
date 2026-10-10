import { Console, Effect } from "effect";
import { Argument, Command, Flag } from "effect/cli";
import { writeKaktusFx } from "~/kaktus-write/fx/writeKaktusFx";
import { WriteError } from "~/kaktus-write/error/WriteError";
import { formatWriteSummaryFn } from "~/kaktus-write/fn/formatWriteSummaryFn";
import { escapeLineFn } from "~/text-output/fn/escapeLineFn";
import type { WriteOptionsSchema } from "~/kaktus-write/schema/WriteOptionsSchema";
import { BestEffortFlag } from "../flag/BestEffortFlag";

const runImportKaktusCommandFx = Effect.fn("runImportKaktusCommandFx")(function* (
	options: WriteOptionsSchema.Type,
) {
	const summary = yield* writeKaktusFx(options);
	yield* Console.log(
		`${formatWriteSummaryFn(summary)}\nReport: ${escapeLineFn(summary.publication.path)}\nRun: ${escapeLineFn(summary.run)}\nLog: ${escapeLineFn(summary.log)}\nAudit: ${escapeLineFn(summary.audit.path)} (${summary.audit.completion})`,
	);
	const unconfirmed = summary.unknown + summary.notAttempted > 0;
	const strictRejection = !options.bestEffort && summary.rejected > 0;
	const noSuccessfulWrites = summary.written + summary.alreadyWritten === 0;
	if (unconfirmed || strictRejection || noSuccessfulWrites)
		return yield* Effect.fail(
			new WriteError({
				detail: `Import is incomplete; inspect ${summary.publication.path}. Confirmed target writes remain committed.`,
			}),
		);
});

export const ImportKaktusCommand = Command.make(
	"import",
	{
		input: Argument.String("intermediate-file"),
		simulator: Flag.String("simulator").pipe(
			Flag.withDefault("kaktus/kaktus.cjs"),
			Flag.withDescription(
				"Supplied simulator script; DATA is resolved beside it. Invoked through this Node runtime.",
			),
		),
		output: Flag.String("output").pipe(Flag.withDefault(".out/write.txt")),
		state: Flag.String("state").pipe(
			Flag.withDefault(".out/kaktus-write-state"),
			Flag.withDescription(
				"Retained intent, response and outcome directory; keep it across runs.",
			),
		),
		actor: Flag.String("actor"),
		bestEffort: BestEffortFlag,
		maxRecordBytes: Flag.Int("max-record-bytes").pipe(Flag.withDefault(64 * 1024)),
	},
	runImportKaktusCommandFx,
).pipe(
	Command.withDescription(
		"Import intermediate invoice requests into Kaktus through XML and publish a human per-document report.",
	),
);
