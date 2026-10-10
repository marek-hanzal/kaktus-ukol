import { Effect, Path } from "effect";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { ImportOptionsSchema } from "../schema/ImportOptionsSchema";
import { InputPathConflictError } from "../error/InputPathConflictError";
import { readIntermediateStream } from "../stream/readIntermediateStream";
import { importRecordsFx } from "./importRecordsFx";

/** Select the native intermediate adapter; validation is shared by every source adapter. */
export const importIntermediateFx = Effect.fn("importIntermediateFx")(function* (
	inputOptions: ImportOptionsSchema.Type,
) {
	const options = yield* parseRecordFx(
		ImportOptionsSchema,
		inputOptions,
		"intermediate import options",
	);
	const path = yield* Path.Path;
	const log = yield* ProcessingLog;
	const input = path.resolve(options.input);
	const output = path.resolve(options.output);
	for (const conflict of [
		output,
		log.path,
	]) {
		if (input.toLowerCase() === conflict.toLowerCase()) {
			return yield* Effect.fail(
				new InputPathConflictError({
					input,
					conflict,
				}),
			);
		}
	}
	return yield* importRecordsFx({
		records: readIntermediateStream({
			path: input,
			maxRecordBytes: options.maxRecordBytes,
			chunkBytes: 16 * 1024,
		}),
		publication: {
			output,
			maxChunkBytes: options.maxRecordBytes + 1,
		},
	});
});
