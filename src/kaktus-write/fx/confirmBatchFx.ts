import { Effect } from "effect";
import { match } from "ts-pattern";
import type { PlanSchema } from "../schema/PlanSchema";
import type { ResponseDocumentSchema } from "../schema/ResponseDocumentSchema";
import type { OutcomeSchema } from "../schema/OutcomeSchema";
import { WriteError } from "../error/WriteError";
import { recordOutcomeFx } from "./recordOutcomeFx";
import { storeAttemptFx } from "./storeAttemptFx";
import { storeValueFx } from "./storeValueFx";

/** Confirm only a complete admitted response, preserving source identity for every ordinal. */
export const confirmBatchFx = Effect.fn("confirmBatchFx")(function* (
	run: string,
	state: string,
	xml: string,
	response: string,
	plans: readonly PlanSchema.Type[],
	documents: readonly ResponseDocumentSchema.Type[],
) {
	yield* storeValueFx(`${response}.results.json`, documents);
	let written = 0;
	let rejected = 0;
	for (const document of documents) {
		const plan = plans[document.poradi - 1];
		if (plan === undefined)
			return yield* Effect.fail(
				new WriteError({
					detail: "Admitted response ordinal has no source request",
				}),
			);
		const outcome = match(document)
			.returnType<OutcomeSchema.Type>()
			.with(
				{
					stav: "OK",
				},
				(document) => ({
					source: plan.source,
					requestId: plan.requestId,
					companyId: plan.companyId,
					status: "written",
					code: "OK",
					detail: "Confirmed by Kaktus response",
					documentNumber: document.doklad,
				}),
			)
			.with(
				{
					stav: "CHYBA",
				},
				(document) => ({
					source: plan.source,
					requestId: plan.requestId,
					companyId: plan.companyId,
					status: "rejected",
					code: document.kod,
					detail: document.zprava,
					documentNumber: null,
				}),
			)
			.exhaustive();
		yield* storeAttemptFx(state, plan, {
			requestId: plan.requestId,
			companyId: plan.companyId,
			fingerprint: plan.fingerprint,
			status: document.stav === "OK" ? "written" : "rejected",
			documentNumber: outcome.documentNumber,
			run,
			batch: xml,
		});
		yield* recordOutcomeFx(run, outcome);
		if (document.stav === "OK") written += 1;
		else rejected += 1;
	}
	return {
		written,
		rejected,
	};
});
