import { Effect, Stream } from "effect";
import type { PlanSchema } from "../schema/PlanSchema";
import { createPlanStreamFx } from "./createPlanStreamFx";

/** Split consecutive company requests without buffering more than twenty plans. */
export const createBatchesStreamFx = Effect.fnUntraced(function* (file: string) {
	let batch: PlanSchema.Type[] = [];
	const plans = yield* createPlanStreamFx(file);
	return plans.pipe(
		Stream.map((plan) => {
			const first = batch[0];
			if (
				first !== undefined &&
				(batch.length === 20 || first.companyId !== plan.companyId)
			) {
				const complete = batch;
				batch = [
					plan,
				];
				return complete;
			}
			batch.push(plan);
			return null;
		}),
		Stream.filter((batch) => batch !== null),
		Stream.concat(
			Stream.suspend(() => (batch.length === 0 ? Stream.empty : Stream.make(batch))),
		),
	);
});
