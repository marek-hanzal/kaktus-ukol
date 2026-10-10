import { Effect } from "effect";
import type { RecordSchema } from "~/accounting-record/schema/RecordSchema";
import { RecordSchema as DomainRecordSchema } from "~/accounting-record/schema/RecordSchema";
import { validateRecordFx } from "~/accounting-record/fx/validateRecordFx";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { IntermediateOutputSchema } from "~/record-export/schema/IntermediateOutputSchema";
import { toIntermediateOutputFn } from "~/record-export/fn/toIntermediateOutputFn";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { DifferenceSchema } from "../schema/DifferenceSchema";
import { getIdentityFn } from "../fn/getIdentityFn";
import { RecordComparisonError } from "../error/RecordComparisonError";

/** Compare the current admitted record with incoming data. No writes and no relationship traversal. */
export const compareRecordsFx = Effect.fn("compareRecordsFx")(function* (
	current: RecordSchema.Type,
	incoming: unknown,
) {
	const admittedCurrent = yield* parseRecordFx(
		DomainRecordSchema,
		current,
		"current domain record",
	);
	const admittedIncoming = yield* validateRecordFx(
		yield* parseRecordFx(IntermediateRecordSchema, incoming, "incoming intermediate record"),
	);
	const before = yield* parseRecordFx(
		IntermediateOutputSchema,
		toIntermediateOutputFn(admittedCurrent),
		"current output projection",
	);
	const after = yield* parseRecordFx(
		IntermediateOutputSchema,
		toIntermediateOutputFn(admittedIncoming),
		"incoming output projection",
	);
	const identity = getIdentityFn(before);
	const nextIdentity = getIdentityFn(after);
	if (
		identity.type !== nextIdentity.type ||
		identity.companyId !== nextIdentity.companyId ||
		identity.id !== nextIdentity.id
	)
		return yield* Effect.fail(
			new RecordComparisonError({
				detail: "Comparison requires the same record type, company and ID.",
			}),
		);
	// Only direct data properties. VAT stays one property; supplierId stays a scalar reference.
	const changes = [];
	for (const property of Object.keys(before.data)) {
		const oldValue: unknown = Reflect.get(before.data, property);
		const newValue: unknown = Reflect.get(after.data, property);
		if (JSON.stringify(oldValue) !== JSON.stringify(newValue))
			changes.push({
				property,
				before: oldValue,
				after: newValue,
			});
	}
	return yield* parseRecordFx(
		DifferenceSchema,
		{
			identity,
			changes,
		},
		"record difference",
	);
});
