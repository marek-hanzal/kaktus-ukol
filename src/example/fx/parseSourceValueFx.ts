import { Effect } from "effect";
import { SourceJsonError } from "../error/SourceJsonError";
import type { SourceValueSchema } from "../schema/SourceValueSchema";

const monetaryFields = new Set([
	"celkem",
	"kurz",
	"zaklad",
	"dph",
]);

/** Quote monetary number tokens before JSON decoding; exponents remain text and fail domain admission. */
export const parseSourceValueFx = Effect.fnUntraced(function* (source: SourceValueSchema.Type) {
	return yield* Effect.try({
		try: (): unknown => {
			const parts: string[] = [];
			let start = 0;
			let property: unknown;
			let monetary = false;
			const keys: (Set<string> | null)[] = [];
			const tokens = source.text.matchAll(
				/"(?:[^"\\]|\\[\s\S])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|[^\s]/g,
			);
			for (const token of tokens) {
				const value = token[0];
				if (value === "{") keys.push(new Set());
				else if (value === "[") keys.push(null);
				else if (value === "}" || value === "]") keys.pop();
				if (value === ":") {
					const currentKeys = keys.at(-1);
					if (
						typeof property === "string" &&
						currentKeys !== null &&
						currentKeys !== undefined
					) {
						if (currentKeys.has(property))
							throw new SyntaxError(`Repeated JSON property '${property}'.`);
						currentKeys.add(property);
					}
					monetary = typeof property === "string" && monetaryFields.has(property);
					property = undefined;
					continue;
				}
				if (monetary && /^-?\d/.test(value)) {
					parts.push(source.text.slice(start, token.index), JSON.stringify(value));
					start = token.index + value.length;
				}
				monetary = false;
				property = value.startsWith('"') ? JSON.parse(value) : undefined;
			}
			parts.push(source.text.slice(start));
			return JSON.parse(parts.join(""));
		},
		catch: (cause) =>
			new SourceJsonError({
				path: source.location,
				record: source.record,
				detail: cause instanceof SyntaxError ? cause.message : "Invalid JSON value.",
				cause,
			}),
	});
});
