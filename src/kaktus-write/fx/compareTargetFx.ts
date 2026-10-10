import { Effect, FileSystem, Path } from "effect";
import { match, P } from "ts-pattern";
import type { TargetStatusEnumSchema } from "../schema/TargetStatusEnumSchema";
import type { KaktusInvoiceSchema } from "~/record-export/schema/KaktusInvoiceSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { TargetEntrySchema } from "../schema/TargetEntrySchema";
import { TargetComparisonSchema } from "../schema/TargetComparisonSchema";
import { projectExpectedInvoiceFn } from "../fn/projectExpectedInvoiceFn";
import { readStoredValueFx } from "./readStoredValueFx";

/** Compare only the fresh index, never local history or a vendor acknowledgement. */
export const compareTargetFx = Effect.fnUntraced(function* (
	directory: string,
	businessKey: string,
	invoice: KaktusInvoiceSchema.Type,
) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const file = path.join(directory, `existing-${businessKey}.json`);
	const entry = (yield* fs.exists(file))
		? yield* readStoredValueFx(file, TargetEntrySchema)
		: null;
	const expected = projectExpectedInvoiceFn(invoice);
	const changes = [];
	if (entry?.count === 1)
		for (const property of Object.keys(expected)) {
			const before: unknown = Reflect.get(entry.invoice, property);
			const after: unknown = Reflect.get(expected, property);
			if (before !== after)
				changes.push({
					property,
					before,
					after,
				});
		}
	return yield* parseRecordFx(
		TargetComparisonSchema,
		{
			status: match(entry)
				.returnType<TargetStatusEnumSchema.Type>()
				.with(null, () => "missing")
				.with(
					{
						count: P.when((count) => count > 1),
					},
					() => "ambiguous",
				)
				.with(P._, () => (changes.length > 0 ? "conflict" : "present"))
				.exhaustive(),
			documentNumber: entry?.documentNumber ?? null,
			count: entry?.count ?? 0,
			changes,
		},
		"target comparison",
	);
});
