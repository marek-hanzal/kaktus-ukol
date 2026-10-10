import { Effect } from "effect";
import type { LineSchema } from "../schema/LineSchema";
import { InvalidJsonError } from "../error/InvalidJsonError";

/** JSON.parse returns untrusted data; no business type is asserted here. */
export const parseLineFx = Effect.fnUntraced(function* (
	line: LineSchema.Type,
	path: string,
): Effect.fn.Return<unknown, InvalidJsonError> {
	return yield* Effect.try({
		try: (): unknown => JSON.parse(line.text),
		catch: (cause) =>
			new InvalidJsonError({
				path,
				line: line.number,
				cause,
			}),
	});
});
