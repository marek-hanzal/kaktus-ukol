import { Crypto, Effect } from "effect";
/** Stable bounded filesystem keys without trusting input as a path segment. */
export const hashValueFx = Effect.fnUntraced(function* (value: unknown) {
	const crypto = yield* Crypto.Crypto;
	const bytes = yield* crypto.digest("SHA-256", new TextEncoder().encode(JSON.stringify(value)));
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
});
