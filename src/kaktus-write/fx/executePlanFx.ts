import { Effect, FileSystem, Path, Stream } from "effect";
import { ensureCompanyUnlockedFx } from "~/kaktus/fx/ensureCompanyUnlockedFx";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";
import type { PlanSchema } from "../schema/PlanSchema";
import type { PlanningSummarySchema } from "../schema/PlanningSummarySchema";
import type { WriteOptionsSchema } from "../schema/WriteOptionsSchema";
import { readBatchesStream } from "../stream/readBatchesStream";
import { indexTargetFx } from "./indexTargetFx";
import { storeValueFx } from "./storeValueFx";
import { confirmBatchFx } from "./confirmBatchFx";
import { invokeBatchFx } from "./invokeBatchFx";
import { recordOutcomeFx } from "./recordOutcomeFx";

/** At most twenty same-company documents are resident; uncertain batches are never retried. */
export const executePlanFx = Effect.fn("executePlanFx")(function* (
	options: WriteOptionsSchema.Type,
	run: string,
	data: string,
	planning: PlanningSummarySchema.Type,
) {
	const path = yield* Path.Path;
	const fs = yield* FileSystem.FileSystem;
	const log = yield* ProcessingLog;
	const summary = {
		bestEffort: options.bestEffort,
		written: 0,
		alreadyPresent: planning.alreadyPresent,
		rejected: planning.rejected,
		notAttempted: 0,
		unknown: 0,
		reviewRequired: false,
	};
	let stopped = planning.rejected > 0 && !options.bestEffort;
	let batchNumber = 0;
	const submitFx = Effect.fnUntraced(function* (selected: readonly PlanSchema.Type[]) {
		const companyId = selected[0]?.companyId;
		if (companyId === undefined) return;
		batchNumber += 1;
		const xml = path.join(run, `batch-${batchNumber}-${companyId}.xml`);
		const response = path.join(run, `batch-${batchNumber}-${companyId}.odpoved.xml`);
		const check = yield* ensureCompanyUnlockedFx({
			companyId,
			directory: path.join(data, companyId),
		}).pipe(Effect.result);
		if (check._tag === "Failure") {
			stopped = true;
			for (const plan of selected) {
				summary.notAttempted += 1;
				yield* recordOutcomeFx(run, {
					source: plan.source,
					requestId: plan.requestId,
					companyId,
					status: "not_attempted",
					code: "target_unavailable",
					detail: check.failure.message,
					documentNumber: null,
				});
			}
			return;
		}
		yield* log.writeFx({
			operation: "kaktus-write",
			phase: "progress",
			message: `Submitting ${selected.length} invoices for company ${companyId}; prepared XML: ${xml}`,
		});
		const result = yield* invokeBatchFx(
			options.simulator,
			xml,
			response,
			companyId,
			selected.length,
		).pipe(Effect.result);
		if (result._tag === "Success")
			yield* storeValueFx(`${response}.results.json`, result.success);
		const inventory = path.join(run, "target-after");
		const readback = yield* Effect.gen(function* () {
			if (yield* fs.exists(inventory))
				yield* fs.remove(inventory, {
					recursive: true,
				});
			yield* indexTargetFx(data, inventory, options);
		}).pipe(Effect.result);
		const diagnostic = [
			result._tag === "Failure" ? `Response unavailable: ${result.failure.message}` : null,
			readback._tag === "Failure"
				? `Readback unavailable: ${readback.failure.message}`
				: null,
		]
			.filter((value) => value !== null)
			.join("; ");
		const confirmed = yield* confirmBatchFx(
			run,
			readback._tag === "Success" ? inventory : null,
			selected,
			result._tag === "Success" ? result.success : null,
			diagnostic || null,
		);
		summary.written += confirmed.written;
		summary.rejected += confirmed.rejected;
		summary.unknown += confirmed.unknown;
		if (confirmed.unknown > 0 || (confirmed.rejected > 0 && !options.bestEffort))
			stopped = true;
	});
	yield* readBatchesStream(path.join(run, "plan.ndjson")).pipe(
		Stream.runForEach((batch) =>
			Effect.gen(function* () {
				if (!stopped) return yield* submitFx(batch);
				for (const plan of batch) {
					summary.notAttempted += 1;
					yield* recordOutcomeFx(run, {
						source: plan.source,
						requestId: plan.requestId,
						companyId: plan.companyId,
						status: "not_attempted",
						code: "batch_stopped",
						detail: "Strict admission failed or a previous target batch could not safely continue",
						documentNumber: null,
					});
				}
			}),
		),
	);
	summary.reviewRequired = summary.rejected + summary.unknown + summary.notAttempted > 0;
	return summary;
});
