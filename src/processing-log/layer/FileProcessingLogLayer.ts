import { Clock, Config, Effect, FileSystem, Layer, Path, Semaphore } from "effect";
import { formatEventFn } from "../fn/formatEventFn";
import { ProcessingLog } from "../service/ProcessingLog";
import { ProcessingLogError } from "../error/ProcessingLogError";
import type { EventSchema } from "../schema/EventSchema";
import { LogOptionsSchema } from "../schema/LogOptionsSchema";
import { appendEntryFx } from "~/file-append/fx/appendEntryFx";
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

		return {
			path: output,
			writeFx: Effect.fnUntraced(function* (
				event: EventSchema.Type,
			): Effect.fn.Return<void, ProcessingLogError> {
				const now = yield* Clock.currentTimeMillis;
				const text = `${formatEventFn({
					...event,
					timestamp: new Date(now).toISOString(),
				})}\n`;
				yield* mutex
					.withPermits(1)(appendEntryFx(output, text, options.maxEventBytes))
					.pipe(
						Effect.provideService(FileSystem.FileSystem, fileSystem),
						Effect.provideService(Path.Path, path),
						Effect.mapError(
							(cause) =>
								new ProcessingLogError({
									path: output,
									cause,
								}),
						),
					);
			}),
		} satisfies ProcessingLog;
	}),
);
