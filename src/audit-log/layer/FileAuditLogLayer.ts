import { Config, Effect, FileSystem, Layer, Path, Semaphore } from "effect";
import { formatEntryFn } from "../fn/formatEntryFn";
import { AuditLog } from "../service/AuditLog";
import { AuditLogError } from "../error/AuditLogError";
import { EntrySchema } from "../schema/EntrySchema";
import { appendEntryFx } from "~/file-append/fx/appendEntryFx";

export const FileAuditLogLayer = Layer.effect(
	AuditLog,
	Effect.gen(function* () {
		const path = yield* Path.Path;
		const output = path.resolve(
			yield* Config.String("KAKTUS_AUDIT_FILE").pipe(Config.withDefault(".out/audit.log")),
		);
		const mutex = yield* Semaphore.make(1);
		const fs = yield* FileSystem.FileSystem;
		return {
			path: output,
			writeFx: Effect.fnUntraced(function* (entry: EntrySchema.Type) {
				const validated = EntrySchema.safeParse(entry);
				if (!validated.success)
					return yield* Effect.fail(
						new AuditLogError({
							path: output,
							cause: validated.error,
						}),
					);
				yield* mutex
					.withPermits(1)(appendEntryFx(output, `${formatEntryFn(validated.data)}\n`))
					.pipe(
						Effect.provideService(FileSystem.FileSystem, fs),
						Effect.provideService(Path.Path, path),
						Effect.mapError(
							(cause) =>
								new AuditLogError({
									path: output,
									cause,
								}),
						),
					);
			}),
		} satisfies AuditLog;
	}),
);
