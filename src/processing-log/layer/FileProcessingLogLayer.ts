import { Clock, Config, Effect, FileSystem, Layer, Path, Semaphore } from "effect";
import { formatEventFn } from "../fn/formatEventFn";
import { ProcessingLog } from "../service/ProcessingLog";
import { ProcessingLogError } from "../error/ProcessingLogError";
import type { EventSchema } from "../schema/EventSchema";
import { LogOptionsSchema } from "../schema/LogOptionsSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";

/** Serialize, append and synchronize each event; help alone never creates a log file. */
export const FileProcessingLogLayer = Layer.effect(
	ProcessingLog,
	Effect.gen(function* () {
		const fileSystem = yield* FileSystem.FileSystem;
		const path = yield* Path.Path;
		const options = yield* parseRecordFx(
			LogOptionsSchema,
			{
				path: yield* Config.String("KAKTUS_LOG_FILE").pipe(
					Config.withDefault(".out/processing.log"),
				),
			},
			"processing log options",
		);
		const output = path.resolve(options.path);
		const mutex = yield* Semaphore.make(1);
		const encoder = new TextEncoder();

		return {
			path: output,
			writeFx: Effect.fnUntraced(function* (
				event: EventSchema.Type,
			): Effect.fn.Return<void, ProcessingLogError> {
				yield* mutex.withPermits(1)(
					Effect.scoped(
						Effect.gen(function* () {
							const now = yield* Clock.currentTimeMillis;
							const bytes = encoder.encode(
								`${new Date(now).toISOString()} ${formatEventFn(event)}\n`,
							);
							if (bytes.byteLength > options.maxEventBytes) {
								return yield* Effect.fail(
									new ProcessingLogError({
										path: output,
										cause: new RangeError(
											`Log event exceeds ${options.maxEventBytes} bytes.`,
										),
									}),
								);
							}
							yield* fileSystem.makeDirectory(path.dirname(output), {
								recursive: true,
							});
							const file = yield* fileSystem.open(output, {
								flag: "a",
							});
							yield* file.writeAll(bytes);
							yield* file.sync;
						}),
					).pipe(
						Effect.mapError(
							(cause) =>
								new ProcessingLogError({
									path: output,
									cause,
								}),
						),
					),
				);
			}),
		} satisfies ProcessingLog;
	}),
);
