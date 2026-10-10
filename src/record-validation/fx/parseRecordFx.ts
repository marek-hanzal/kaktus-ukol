import { Effect } from "effect";
import type { z } from "zod";
import { RecordValidationError } from "../error/RecordValidationError";

/** Validate one record without collecting its surrounding dataset. */
export const parseRecordFx = Effect.fnUntraced(function* <Schema extends z.ZodType>(
	schema: Schema,
	input: unknown,
	source: string,
): Effect.fn.Return<z.output<Schema>, RecordValidationError> {
	const parsed = schema.safeParse(input);
	if (!parsed.success)
		return yield* Effect.fail(
			new RecordValidationError({
				schemaId: schema.meta()?.id ?? "unnamed",
				source,
				issues: parsed.error.issues,
			}),
		);
	return parsed.data;
});
