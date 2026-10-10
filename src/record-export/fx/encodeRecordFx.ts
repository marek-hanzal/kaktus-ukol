import { Effect } from "effect";
import { match } from "ts-pattern";
import { RecordSchema } from "~/accounting-record/schema/RecordSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import type { RecordValidationError } from "~/record-validation/error/RecordValidationError";
import { toIntermediateOutputFn } from "../fn/toIntermediateOutputFn";
import { IntermediateOutputSchema } from "../schema/IntermediateOutputSchema";
import { FormatEnumSchema } from "../schema/FormatEnumSchema";
import type { ExportOptionsSchema } from "../schema/ExportOptionsSchema";
import { OutputRecordTooLargeError } from "../error/OutputRecordTooLargeError";

const encoder = new TextEncoder();

/** Validate the projected wire value, then encode one bounded NDJSON record. */
export const encodeRecordFx = Effect.fnUntraced(function* (
	record: RecordSchema.Type,
	options: ExportOptionsSchema.Type,
): Effect.fn.Return<Uint8Array, RecordValidationError | OutputRecordTooLargeError> {
	const source = `${record.source.origin}:${record.source.location}#${record.source.record}`;
	// Re-admit computed values before formatting: excess precision is a typed failure, never a truncation.
	const admitted = yield* parseRecordFx(RecordSchema, record, source);
	const output = match(options.format)
		.with(FormatEnumSchema.enum.intermediate, () => ({
			schema: IntermediateOutputSchema,
			value: toIntermediateOutputFn(admitted),
		}))
		.exhaustive();
	const value = yield* parseRecordFx(output.schema, output.value, source);
	const bytes = encoder.encode(`${JSON.stringify(value)}\n`);
	const actualBytes = bytes.byteLength - 1;
	if (actualBytes > options.maxRecordBytes) {
		return yield* Effect.fail(
			new OutputRecordTooLargeError({
				format: options.format,
				source: value.source,
				actualBytes,
				maxBytes: options.maxRecordBytes,
			}),
		);
	}
	return bytes;
});
