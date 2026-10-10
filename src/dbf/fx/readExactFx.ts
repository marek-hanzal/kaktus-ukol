import { Effect } from "effect";
import type { FileSystem } from "effect";
import { DbfFormatError } from "../error/DbfFormatError";

/** Fill a bounded region even when the host returns partial reads. */
export const readExactFx = Effect.fnUntraced(function* (
	file: FileSystem.File,
	buffer: Uint8Array,
	path: string,
	offset: number,
	record: number | null,
) {
	let filled = 0;
	while (filled < buffer.byteLength) {
		const count = yield* file.read(
			buffer.subarray(filled, Math.min(filled + 16 * 1024, buffer.byteLength)),
		);
		if (count === 0)
			return yield* Effect.fail(
				new DbfFormatError({
					path,
					offset: offset + filled,
					record,
					detail: "Unexpected end of file",
				}),
			);
		filled += count;
	}
});
