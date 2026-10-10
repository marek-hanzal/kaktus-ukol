import { ByteSize, Cause, Effect, FileSystem, Stream } from "effect";
import type { PlatformError } from "effect";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { DbfFormatError } from "../error/DbfFormatError";
import { ReaderOptionsSchema } from "../schema/ReaderOptionsSchema";
import type { RowSchema } from "../schema/RowSchema";
import { decodeRowFx } from "./decodeRowFx";
import { readHeaderFx } from "./readHeaderFx";
import { readExactFx } from "./readExactFx";

/** The caller's stream scope owns the read-only handle; each pull reads one physical slot. */
export const openDbfFx = Effect.fn("openDbfFx")(function* (input: ReaderOptionsSchema.Type) {
	const options = yield* parseRecordFx(ReaderOptionsSchema, input, "DBF reader options");
	const fileSystem = yield* FileSystem.FileSystem;
	const file = yield* fileSystem.open(options.path, {
		flag: "r",
	});
	const info = yield* file.stat;
	if (info.type !== "File")
		return yield* Effect.fail(
			new DbfFormatError({
				path: options.path,
				offset: 0,
				record: null,
				detail: "Expected a regular DBF file",
			}),
		);
	const header = yield* readHeaderFx(file, options);
	const expectedBytes =
		BigInt(header.headerBytes) + BigInt(header.recordCount) * BigInt(header.recordBytes);
	const actualBytes = ByteSize.toBigInt(info.size);
	if (actualBytes !== expectedBytes && actualBytes !== expectedBytes + 1n)
		return yield* Effect.fail(
			new DbfFormatError({
				path: options.path,
				offset: 4,
				record: null,
				detail: "File size disagrees with declared record count and widths",
			}),
		);
	const buffer = new Uint8Array(header.recordBytes);
	let nextRecord = 1;
	const pullFx = Effect.fnUntraced(function* (): Effect.fn.Return<
		readonly [
			RowSchema.Type,
		],
		DbfFormatError | PlatformError.PlatformError | Cause.Done<void>
	> {
		const offset = header.headerBytes + (nextRecord - 1) * header.recordBytes;
		if (nextRecord > header.recordCount) {
			const trailer = new Uint8Array(2);
			const count = yield* file.read(trailer.subarray(0, 1));
			if (count === 0) return yield* Cause.done();
			const after = yield* file.read(trailer.subarray(1));
			if (trailer[0] === 26 && after === 0) return yield* Cause.done();
			return yield* Effect.fail(
				new DbfFormatError({
					path: options.path,
					offset,
					record: null,
					detail: "Unexpected bytes after declared records",
				}),
			);
		}
		yield* readExactFx(file, buffer, options.path, offset, nextRecord);
		if (buffer[0] !== 32 && buffer[0] !== 42)
			return yield* Effect.fail(
				new DbfFormatError({
					path: options.path,
					offset,
					record: nextRecord,
					detail: "Invalid deletion marker",
				}),
			);
		const row =
			buffer[0] === 42
				? {
						number: nextRecord,
						deleted: true,
						fields: {},
					}
				: yield* decodeRowFx(buffer, header, nextRecord, options.path);
		nextRecord += 1;
		return [
			row,
		];
	});
	return {
		header,
		rows: Stream.fromPull(Effect.succeed(pullFx())),
	};
});
