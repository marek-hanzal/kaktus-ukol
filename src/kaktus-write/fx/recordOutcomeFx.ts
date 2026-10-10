import { Effect, Path } from "effect";
import { appendEntryFx } from "~/file-append/fx/appendEntryFx";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { OutcomeSchema } from "../schema/OutcomeSchema";
import { formatOutcomeFn } from "../fn/formatOutcomeFn";

/** Synchronized canonical outcome and its human printer survive final-report failures. */
export const recordOutcomeFx = Effect.fnUntraced(function* (
	run: string,
	input: OutcomeSchema.Type,
) {
	const outcome = yield* parseRecordFx(OutcomeSchema, input, "write outcome");
	const path = yield* Path.Path;
	const log = yield* ProcessingLog;
	yield* appendEntryFx(
		path.join(run, "outcomes.ndjson"),
		`${JSON.stringify(outcome)}\n`,
		1024 * 1024,
	);
	yield* appendEntryFx(path.join(run, "outcomes.txt"), formatOutcomeFn(outcome), 1024 * 1024);
	yield* log.writeFx({
		operation: "kaktus-write",
		phase:
			outcome.status === "written" || outcome.status === "already_present"
				? "progress"
				: "failed",
		message: formatOutcomeFn(outcome).trimEnd(),
	});
});
