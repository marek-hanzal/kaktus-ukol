import { Effect } from "effect";
import type { FileSystem } from "effect";
import { match } from "ts-pattern";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { DbfFormatError } from "../error/DbfFormatError";
import { HeaderSchema } from "../schema/HeaderSchema";
import type { ReaderOptionsSchema } from "../schema/ReaderOptionsSchema";
import { readExactFx } from "./readExactFx";

/** Validate framing before allocating a row or decoding any business values. */
export const readHeaderFx = Effect.fn("readHeaderFx")(function* (
	file: FileSystem.File,
	options: ReaderOptionsSchema.Type,
) {
	const fixed = new Uint8Array(32);
	yield* readExactFx(file, fixed, options.path, 0, null);
	const view = new DataView(fixed.buffer);
	const headerBytes = view.getUint16(8, true);
	const recordBytes = view.getUint16(10, true);
	const fail = (detail: string, offset: number) =>
		Effect.fail(
			new DbfFormatError({
				path: options.path,
				offset,
				record: null,
				detail,
			}),
		);
	if (fixed[0] !== 3)
		return yield* fail("Only dBase III without memo fields (0x03) is supported", 0);
	if (headerBytes < 65 || (headerBytes - 33) % 32 !== 0)
		return yield* fail("Invalid header length", 8);
	if (recordBytes > options.maxRecordBytes)
		return yield* fail(`Record exceeds ${options.maxRecordBytes} bytes`, 10);
	const encoding = yield* match(options.encoding)
		.with("cp852", "windows-1250", (encoding) => Effect.succeed(encoding))
		.with("auto", () =>
			match(fixed[29])
				.with(0x64, 0x87, () => Effect.succeed("cp852" as const))
				.with(0xc8, () => Effect.succeed("windows-1250" as const))
				.otherwise((driver) =>
					fail(`Unknown language driver ${driver}; select an explicit encoding`, 29),
				),
		)
		.exhaustive();
	const descriptors = new Uint8Array(headerBytes - 32);
	yield* readExactFx(file, descriptors, options.path, 32, null);
	if (descriptors[descriptors.length - 1] !== 13)
		return yield* fail("Missing field descriptor terminator", headerBytes - 1);
	const fields = [];
	for (let offset = 0; offset < descriptors.length - 1; offset += 32) {
		const descriptor = descriptors.subarray(offset, offset + 32);
		const nameBytes = descriptor.subarray(0, 11);
		const end = nameBytes.indexOf(0);
		fields.push({
			name: String.fromCharCode(...nameBytes.subarray(0, end === -1 ? 11 : end)),
			type: String.fromCharCode(descriptor[11] ?? 0),
			length: descriptor[16],
			decimals: descriptor[17],
		});
	}
	const header = yield* parseRecordFx(
		HeaderSchema,
		{
			headerBytes,
			recordBytes,
			recordCount: view.getUint32(4, true),
			encoding,
			fields,
		},
		options.path,
	).pipe(Effect.catchTag("RecordValidationError", (error) => fail(error.message, 32)));
	if (1 + header.fields.reduce((size, field) => size + field.length, 0) !== recordBytes)
		return yield* fail("Field widths do not match record length", 10);
	if (new Set(header.fields.map((field) => field.name)).size !== fields.length)
		return yield* fail("Duplicate field names", 32);
	return header;
});
