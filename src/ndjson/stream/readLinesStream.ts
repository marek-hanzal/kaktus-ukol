import { Cause, Effect, FileSystem, Option, Stream } from "effect";
import type { PlatformError } from "effect";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import type { RecordValidationError } from "~/record-validation/error/RecordValidationError";
import { ReaderOptionsSchema } from "../schema/ReaderOptionsSchema";
import type { LineSchema } from "../schema/LineSchema";
import { LineTooLargeError } from "../error/LineTooLargeError";
import { InvalidEncodingError } from "../error/InvalidEncodingError";

type ReadError = PlatformError.PlatformError | LineTooLargeError | InvalidEncodingError;

/** Pull one physical line at a time, bounding bytes before decoding or parsing JSON. */
export const readLinesStream = (
	input: ReaderOptionsSchema.Type,
): Stream.Stream<LineSchema.Type, ReadError | RecordValidationError, FileSystem.FileSystem> =>
	Stream.unwrap(
		Effect.gen(function* () {
			const options = yield* parseRecordFx(
				ReaderOptionsSchema,
				input,
				"NDJSON reader options",
			);
			const fileSystem = yield* FileSystem.FileSystem;
			const file = yield* fileSystem.open(options.path, {
				flag: "r",
			});
			const buffer = new Uint8Array(options.maxRecordBytes);
			const decoder = new TextDecoder("utf-8", {
				fatal: true,
			});
			let chunk: Uint8Array = new Uint8Array(0);
			let cursor = 0;
			let size = 0;
			let number = 1;
			let ended = false;

			const emitLineFx = Effect.fnUntraced(function* (): Effect.fn.Return<
				readonly [
					LineSchema.Type,
				],
				InvalidEncodingError
			> {
				const length = size > 0 && buffer[size - 1] === 13 ? size - 1 : size;
				const text = yield* Effect.try({
					try: () => decoder.decode(buffer.subarray(0, length)),
					catch: (cause) =>
						new InvalidEncodingError({
							path: options.path,
							line: number,
							cause,
						}),
				});
				const line = {
					number,
					text,
				} satisfies LineSchema.Type;
				number += 1;
				size = 0;
				return [
					line,
				];
			});

			const pull = Effect.fnUntraced(function* (): Effect.fn.Return<
				readonly [
					LineSchema.Type,
				],
				ReadError | Cause.Done<void>
			> {
				if (ended) return yield* Cause.done();
				while (true) {
					if (cursor === chunk.byteLength) {
						const next = yield* file.readAlloc(options.chunkBytes);
						if (Option.isNone(next)) {
							ended = true;
							if (size === 0) return yield* Cause.done();
							return yield* emitLineFx();
						}
						chunk = next.value;
						cursor = 0;
					}
					const newline = chunk.indexOf(10, cursor);
					const end = newline === -1 ? chunk.byteLength : newline;
					const length = end - cursor;
					if (size + length > options.maxRecordBytes) {
						return yield* Effect.fail(
							new LineTooLargeError({
								path: options.path,
								line: number,
								maxBytes: options.maxRecordBytes,
							}),
						);
					}
					buffer.set(chunk.subarray(cursor, end), size);
					size += length;
					cursor = end;
					if (newline !== -1) {
						cursor += 1;
						return yield* emitLineFx();
					}
				}
			});

			return Stream.fromPull(Effect.succeed(pull()));
		}),
	);
