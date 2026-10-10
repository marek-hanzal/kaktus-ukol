import { match } from "ts-pattern";
import type { TargetComparisonSchema } from "../schema/TargetComparisonSchema";

export const formatTargetComparisonFn = (comparison: TargetComparisonSchema.Type): string =>
	match(comparison.status)
		.with(
			"missing",
			() => "No invoice with this business identity exists in the fresh target inventory",
		)
		.with("present", () => "All imported invoice properties match the fresh target inventory")
		.with(
			"ambiguous",
			() =>
				`${comparison.count} target invoices share this business identity; refusing to choose`,
		)
		.with("conflict", () =>
			comparison.changes
				.map(
					(change) =>
						`${change.property}: target=${JSON.stringify(change.before)}; incoming=${JSON.stringify(change.after)}`,
				)
				.join("; "),
		)
		.exhaustive();
