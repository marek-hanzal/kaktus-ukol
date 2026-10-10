import { Argument, Command, Flag } from "effect/cli";
import { Console, Effect } from "effect";
import { compareFilesFx } from "~/record-comparison/fx/compareFilesFx";
import { formatDifferenceFn } from "~/record-comparison/fn/formatDifferenceFn";
import type { ComparisonOptionsSchema } from "~/record-comparison/schema/ComparisonOptionsSchema";
import { escapeLineFn } from "~/text-output/fn/escapeLineFn";
const runCompareRecordCommandFx = Effect.fn("runCompareRecordCommandFx")(function* (
	options: ComparisonOptionsSchema.Type,
) {
	const result = yield* compareFilesFx(options);
	for (const line of formatDifferenceFn(result.difference)) yield* Console.log(line);
	yield* Console.log(
		`Report: ${escapeLineFn(result.publication.path)}\nAudit: ${escapeLineFn(result.audit.path)}; operation ${result.audit.operationId}; completion ${result.audit.completion}`,
	);
});
export const CompareRecordCommand = Command.make(
	"compare-record",
	{
		current: Argument.String("current"),
		incoming: Argument.String("incoming"),
		output: Flag.String("output").pipe(Flag.withDefault(".out/difference.log")),
		actor: Flag.String("actor"),
		maxRecordBytes: Flag.Int("max-record-bytes").pipe(Flag.withDefault(64 * 1024)),
	},
	runCompareRecordCommandFx,
).pipe(
	Command.withDescription(
		"Compare two single-record intermediate files by direct business properties; publish a text report.",
	),
);
