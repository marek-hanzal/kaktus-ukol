import type { PropertyChangeSchema } from "../schema/PropertyChangeSchema";
import type { DifferenceSchema } from "../schema/DifferenceSchema";
import { escapeLineFn } from "~/text-output/fn/escapeLineFn";

const formatValueFn = (value: PropertyChangeSchema.Type["before"]): string => {
	if (value === null) return "<null>";
	if (typeof value === "string") return `"${escapeLineFn(value).replaceAll('"', '\\"')}"`;
	if (Array.isArray(value)) return value.map(formatValueFn).join("; ");
	if (typeof value === "object")
		return Object.entries(value)
			.map(([name, entry]) => `${escapeLineFn(name)}=${formatValueFn(entry)}`)
			.join("; ");
	return escapeLineFn(String(value));
};
/** One printable line per direct property change; this does not resolve referenced records. */
export function* formatDifferenceFn(difference: DifferenceSchema.Type): Generator<string> {
	const identity = difference.identity;
	yield `Compared ${identity.type}, company ${escapeLineFn(identity.companyId ?? "<none>")}, ID ${escapeLineFn(String(identity.id))}: ${difference.changes.length} changed properties.`;
	for (const change of difference.changes)
		yield `${escapeLineFn(change.property)}: [${formatValueFn(change.before)}] -> [${formatValueFn(change.after)}]`;
}
