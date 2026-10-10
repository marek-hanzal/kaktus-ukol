import { Effect } from "effect";
import { match } from "ts-pattern";
import type { PlanSchema } from "../schema/PlanSchema";
import type { ResponseDocumentSchema } from "../schema/ResponseDocumentSchema";
import type { OutcomeSchema } from "../schema/OutcomeSchema";
import { formatTargetComparisonFn } from "../fn/formatTargetComparisonFn";
import { compareTargetFx } from "./compareTargetFx";
import { recordOutcomeFx } from "./recordOutcomeFx";

/** Actual persisted invoice properties are authoritative, even if the response was lost. */
export const confirmBatchFx = Effect.fn("confirmBatchFx")(function* (
	run: string,
	inventory: string | null,
	plans: readonly PlanSchema.Type[],
	documents: readonly ResponseDocumentSchema.Type[] | null,
	diagnostic: string | null,
) {
	const counts = {
		written: 0,
		rejected: 0,
		unknown: 0,
	};
	for (const [index, plan] of plans.entries()) {
		const comparison =
			inventory === null
				? null
				: yield* compareTargetFx(inventory, plan.businessKey, plan.invoice);
		const document = documents?.[index];
		const rejection =
			comparison?.status === "missing" && document?.stav === "CHYBA" ? document : null;
		const status = match({
			present: comparison?.status === "present",
			rejected: rejection !== null,
		})
			.returnType<"written" | "rejected" | "unknown">()
			.with(
				{
					present: true,
				},
				() => "written",
			)
			.with(
				{
					present: false,
					rejected: true,
				},
				() => "rejected",
			)
			.with(
				{
					present: false,
					rejected: false,
				},
				() => "unknown",
			)
			.exhaustive();
		const outcome: OutcomeSchema.Type = {
			source: plan.source,
			requestId: plan.requestId,
			companyId: plan.companyId,
			status,
			code:
				rejection?.kod ??
				(status === "written" ? "VERIFIED_READBACK" : "unconfirmed_target_write"),
			detail: [
				comparison === null
					? "Target readback failed"
					: formatTargetComparisonFn(comparison),
				rejection?.zprava,
				diagnostic,
			]
				.filter((value) => value !== undefined && value !== null)
				.join("; "),
			documentNumber: status === "written" ? (comparison?.documentNumber ?? null) : null,
		};
		yield* recordOutcomeFx(run, outcome);
		match(status)
			.with("written", () => {
				counts.written += 1;
			})
			.with("rejected", () => {
				counts.rejected += 1;
			})
			.with("unknown", () => {
				counts.unknown += 1;
			})
			.exhaustive();
	}
	return counts;
});
