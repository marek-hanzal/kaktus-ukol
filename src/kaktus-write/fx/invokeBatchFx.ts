import { execPath } from "node:process";
import { Effect, FileSystem, Stream } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";
import iconv from "iconv-lite";
import { WriteError } from "../error/WriteError";
import { parseResponseFx } from "./parseResponseFx";

/** Shell-free simulator invocation; process output stays on disk and never implies document success. */
export const invokeBatchFx = Effect.fn("invokeBatchFx")(function* (
	simulator: string,
	batch: string,
	response: string,
	companyId: string,
	count: number,
) {
	const fs = yield* FileSystem.FileSystem;
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	return yield* Effect.scoped(
		Effect.gen(function* () {
			const child = yield* spawner.spawn(
				ChildProcess.make(
					execPath,
					[
						simulator,
						"import",
						batch,
						response,
					],
					{
						stdin: "ignore",
					},
				),
			);
			const [exit] = yield* Effect.all(
				[
					child.exitCode,
					Stream.run(child.stdout, fs.sink(`${batch}.stdout`)),
					Stream.run(child.stderr, fs.sink(`${batch}.stderr`)),
				],
				{
					concurrency: 3,
				},
			);
			if (exit !== 0)
				return yield* Effect.fail(
					new WriteError({
						detail: `Kaktus exited ${exit}; inspect ${batch}.stderr. Submitted outcomes remain unknown until reconciled.`,
					}),
				);
			const file = yield* fs.open(response, {
				flag: "r",
			});
			const buffer = new Uint8Array(256 * 1024 + 1);
			let length = 0;
			while (length < buffer.length) {
				const read = yield* file.read(buffer.subarray(length));
				if (read === 0) break;
				length += read;
			}
			if (length > 256 * 1024)
				return yield* Effect.fail(
					new WriteError({
						detail: "Kaktus response exceeds the bounded 256 KiB limit",
					}),
				);
			return yield* parseResponseFx(
				iconv.decode(buffer.subarray(0, length), "windows-1250"),
				companyId,
				count,
			);
		}),
	).pipe(Effect.timeout("60 seconds"));
});
