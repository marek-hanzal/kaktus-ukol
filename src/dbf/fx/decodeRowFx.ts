import iconv from "iconv-lite";
import { Effect } from "effect";
import { match } from "ts-pattern";
import type { HeaderSchema } from "../schema/HeaderSchema";
import type { RowSchema } from "../schema/RowSchema";
import { DbfFormatError } from "../error/DbfFormatError";

/** Remove only DBF space padding, retaining numeric spelling and leading text spaces. */
export const decodeRowFx = Effect.fnUntraced(function* (
	bytes: Uint8Array,
	header: HeaderSchema.Type,
	number: number,
	path: string,
): Effect.fn.Return<RowSchema.Type, DbfFormatError> {
	let offset = 1;
	const fields: Record<string, string> = {};
	for (const field of header.fields) {
		const text = iconv.decode(
			Buffer.from(bytes.subarray(offset, offset + field.length)),
			header.encoding,
		);
		if (text.includes("\ufffd"))
			return yield* Effect.fail(
				new DbfFormatError({
					path,
					record: number,
					offset: header.headerBytes + (number - 1) * header.recordBytes + offset,
					detail: `Undecodable ${header.encoding} byte in field ${field.name}`,
				}),
			);
		fields[field.name] = match(field.type)
			.with("C", () => text.replace(/ +$/, ""))
			.with("N", "D", "L", () => text.replace(/^ +| +$/g, ""))
			.exhaustive();
		offset += field.length;
	}
	return {
		number,
		deleted: bytes[0] === 42,
		fields,
	};
});
