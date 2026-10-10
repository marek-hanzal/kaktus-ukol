import { Effect, FileSystem, Path, Stream } from "effect";
import type { PublishedFileSchema } from "../schema/PublishedFileSchema";
import { PublicationOptionsSchema } from "../schema/PublicationOptionsSchema";
import { ChunkTooLargeError } from "../error/ChunkTooLargeError";
import { PublicationTargetConflictError } from "../error/PublicationTargetConflictError";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { AuditLog } from "~/audit-log/service/AuditLog";
import { canonicalPathFx } from "~/file-boundary/fx/canonicalPathFx";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";

interface Props<E, R> {
	readonly content: Stream.Stream<Uint8Array, E, R>;
	readonly options: PublicationOptionsSchema.Type;
}

/**
 * Publish one complete file without exposing intermediate bytes.
 * Staging lives beside the destination, and the handle closes before rename for Windows.
 * File sync precedes commit; this does not promise directory durability across power loss.
 */
export const publishFileFx = Effect.fn("publishFileFx")(function* <E, R>({
	content,
	options: inputOptions,
}: Props<E, R>) {
	const options = yield* parseRecordFx(
		PublicationOptionsSchema,
		inputOptions,
		"publication options",
	);
	const fileSystem = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const log = yield* ProcessingLog;
	const audit = yield* AuditLog;
	const output = path.resolve(options.output);
	const parent = path.dirname(output);
	const operation = "file-publication";

	// Conservatively reject case variants on every host so the contract is portable to Windows.
	const canonical = (yield* canonicalPathFx(output)).toLowerCase();
	if (
		canonical === (yield* canonicalPathFx(log.path)).toLowerCase() ||
		canonical === (yield* canonicalPathFx(audit.path)).toLowerCase()
	) {
		return yield* Effect.fail(
			new PublicationTargetConflictError({
				path: output,
			}),
		);
	}

	yield* log.writeFx({
		operation,
		phase: "started",
		message: output,
	});

	const receipt = yield* Effect.scoped(
		Effect.uninterruptibleMask((restoreFx) =>
			Effect.gen(function* () {
				yield* restoreFx(
					fileSystem.makeDirectory(parent, {
						recursive: true,
					}),
				);
				const staging = yield* fileSystem.makeTempDirectoryScoped({
					directory: parent,
					prefix: ".kaktus-staging-",
				});
				const pending = path.join(staging, "content");
				let bytes = 0;
				let nextProgress = 16 * 1024 * 1024;

				// Cancellation is allowed while staging. Once staging settles, commit is indivisible.
				yield* restoreFx(
					Effect.scoped(
						Effect.gen(function* () {
							const file = yield* fileSystem.open(pending, {
								flag: "wx",
							});
							yield* Stream.runForEach(content, (chunk) =>
								Effect.gen(function* () {
									if (chunk.byteLength > options.maxChunkBytes) {
										return yield* Effect.fail(
											new ChunkTooLargeError({
												actualBytes: chunk.byteLength,
												maxBytes: options.maxChunkBytes,
											}),
										);
									}
									yield* file.writeAll(chunk);
									bytes += chunk.byteLength;
									if (bytes >= nextProgress) {
										yield* log.writeFx({
											operation,
											phase: "progress",
											message: `Staged ${bytes} bytes for ${output}`,
										});
										nextProgress = bytes + 16 * 1024 * 1024;
									}
								}),
							);
							yield* file.sync;
						}),
					),
				);

				// Never emulate replacement with remove + rename: that would destroy atomic publication.
				yield* fileSystem.rename(pending, output);
				return {
					path: output,
					bytes,
				} satisfies PublishedFileSchema.Type;
			}),
		),
	).pipe(
		Effect.onError(() =>
			log
				.writeFx({
					operation,
					phase: "failed",
					message: `Publication did not complete: ${output}`,
				})
				.pipe(Effect.ignore),
		),
	);

	// Diagnostic failure after commit must not turn a complete publication into a failed write.
	yield* log
		.writeFx({
			operation,
			phase: "succeeded",
			message: `Published ${receipt.bytes} bytes to ${receipt.path}`,
		})
		.pipe(Effect.ignore);
	return receipt;
});
