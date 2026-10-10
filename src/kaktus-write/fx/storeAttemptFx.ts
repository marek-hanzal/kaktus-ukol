import { Effect, Path } from "effect";
import type { AttemptSchema } from "../schema/AttemptSchema";
import type { PlanSchema } from "../schema/PlanSchema";
import { storeValueFx } from "./storeValueFx";

/** Both identity keys retain an intent until the corresponding confirmation is durable. */
export const storeAttemptFx = Effect.fnUntraced(function* (
	state: string,
	plan: PlanSchema.Type,
	attempt: AttemptSchema.Type,
) {
	const path = yield* Path.Path;
	// Business intent first also blocks a different request ID after an uncertain write.
	yield* storeValueFx(path.join(state, `business-${plan.businessKey}.json`), attempt);
	yield* storeValueFx(path.join(state, `request-${plan.requestKey}.json`), attempt);
});
