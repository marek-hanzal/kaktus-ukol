import { Cause, Effect, FileSystem, Option, Stream } from "effect";
import type { PlatformError } from "effect";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { SourceJsonError } from "../error/SourceJsonError";
import { SourceRecordTooLargeError } from "../error/SourceRecordTooLargeError";
import { SourceFileEnumSchema } from "../schema/SourceFileEnumSchema";
import type { SourceValueSchema } from "../schema/SourceValueSchema";

type ReadError = PlatformError.PlatformError | SourceJsonError | SourceRecordTooLargeError;

const whitespaceFn = (byte: number): boolean =>
	byte === 32 || byte === 9 || byte === 10 || byte === 13;

/** Frame one value at a time; document punctuation and each record are checked without collecting arrays. */
export const readSourceValuesStream = (
	path: string,
	kind: SourceFileEnumSchema.Type,
	maxRecordBytes: number,
): Stream.Stream<SourceValueSchema.Type, ReadError, FileSystem.FileSystem> =>
	Stream.unwrap(
		Effect.gen(function* () {
			const fileSystem = yield* FileSystem.FileSystem;
			const file = yield* fileSystem.open(path, {
				flag: "r",
			});
			const buffer = new Uint8Array(maxRecordBytes);
			const decoder = new TextDecoder("utf-8", {
				fatal: true,
			});
			let chunk: Uint8Array = new Uint8Array(0);
			let cursor = 0;
			let pending: number | undefined;
			let ended = false;
			let record = 1;
			let initialized = false;
			let arrayOpen = false;
			let firstItem = true;
			let firstProperty = true;
			let officeSeen = false;
			let clientsSeen = false;
			let arrayRecord = 0;
			const invoices = kind === SourceFileEnumSchema.enum.invoices;
			const arrayType = invoices
				? TypeEnumSchema.enum.invoice_request
				: TypeEnumSchema.enum.client;
			const arrayLocation = invoices ? path : `${path}#/klienti`;

			const invalidFx = (detail: string) =>
				Effect.fail(
					new SourceJsonError({
						path,
						record,
						detail,
					}),
				);

			const readByteFx = Effect.fnUntraced(function* () {
				if (pending !== undefined) {
					const byte = pending;
					pending = undefined;
					return byte;
				}
				if (cursor === chunk.byteLength) {
					if (ended) return undefined;
					const next = yield* file.readAlloc(16 * 1024);
					if (Option.isNone(next)) {
						ended = true;
						return undefined;
					}
					chunk = next.value;
					cursor = 0;
				}
				const byte = chunk[cursor];
				cursor += 1;
				return byte;
			});

			const readSignificantByteFx = Effect.fnUntraced(function* () {
				let byte = yield* readByteFx();
				while (byte !== undefined && whitespaceFn(byte)) byte = yield* readByteFx();
				return byte;
			});

			const expectFx = Effect.fnUntraced(function* (expected: number) {
				const byte = yield* readSignificantByteFx();
				if (byte !== expected)
					return yield* invalidFx(`Expected '${String.fromCharCode(expected)}'.`);
			});

			// Structural framing only. JSON decoding subsequently verifies escapes, literals and bracket matching.
			const readValueFx = Effect.fnUntraced(function* (first: number | undefined) {
				if (first === undefined) return yield* invalidFx("Unexpected end of document.");
				let size = 0;
				let byte: number | undefined = first;
				let depth = 0;
				let quoted = false;
				let escaped = false;
				const structured = first === 123 || first === 91;
				const string = first === 34;
				const primitive = !structured && !string;
				const delimiterFn = (value: number): boolean =>
					whitespaceFn(value) || value === 44 || value === 93 || value === 125;
				const advanceFrameFn = (value: number): boolean => {
					if (escaped) {
						escaped = false;
						return false;
					}
					if (quoted) {
						if (value === 92) escaped = true;
						else if (value === 34) quoted = false;
						return string && !quoted;
					}
					if (value === 34) quoted = true;
					else if (value === 123 || value === 91) depth += 1;
					else if (value === 125 || value === 93) depth -= 1;
					return structured && depth === 0;
				};
				while (byte !== undefined) {
					if (primitive && delimiterFn(byte)) {
						pending = byte;
						break;
					}
					if (size === maxRecordBytes)
						return yield* Effect.fail(
							new SourceRecordTooLargeError({
								path,
								record,
								maxBytes: maxRecordBytes,
							}),
						);
					buffer[size] = byte;
					size += 1;
					if (advanceFrameFn(byte)) break;
					byte = yield* readByteFx();
				}
				if (size === 0 || quoted || depth !== 0)
					return yield* invalidFx("Incomplete JSON value.");
				return yield* Effect.try({
					try: () => decoder.decode(buffer.subarray(0, size)),
					catch: (cause) =>
						new SourceJsonError({
							path,
							record,
							detail: "Invalid UTF-8.",
							cause,
						}),
				});
			});

			const nextArrayValueFx = Effect.fnUntraced(function* () {
				let byte = yield* readSignificantByteFx();
				if (byte === 93) {
					arrayOpen = false;
					return null;
				}
				if (!firstItem) {
					if (byte !== 44) return yield* invalidFx("Expected ',' or ']'.");
					byte = yield* readSignificantByteFx();
					if (byte === 93) return yield* invalidFx("Trailing array comma.");
				}
				firstItem = false;
				return yield* readValueFx(byte);
			});

			const finishFx = Effect.fnUntraced(function* () {
				if ((yield* readSignificantByteFx()) !== undefined)
					return yield* invalidFx("Unexpected data after document.");
			});

			/** The clients document has exactly one office value and one independently streamed client array. */
			const readClientPropertyFx = Effect.fnUntraced(function* (): Effect.fn.Return<
				SourceValueSchema.Type | null,
				ReadError | Cause.Done<void>
			> {
				let byte = yield* readSignificantByteFx();
				if (byte === 125) {
					if (!officeSeen || !clientsSeen)
						return yield* invalidFx("Both 'kancelar' and 'klienti' are required.");
					yield* finishFx();
					return yield* Cause.done();
				}
				if (!firstProperty) {
					if (byte !== 44) return yield* invalidFx("Expected ',' or '}'.");
					byte = yield* readSignificantByteFx();
				}
				if (byte !== 34) return yield* invalidFx("Expected a document property name.");
				const keyText = yield* readValueFx(byte);
				const key = yield* Effect.try({
					try: (): unknown => JSON.parse(keyText),
					catch: (cause) =>
						new SourceJsonError({
							path,
							record,
							detail: "Invalid document property.",
							cause,
						}),
				});
				yield* expectFx(58);
				firstProperty = false;
				if (key === "kancelar" && !officeSeen) {
					officeSeen = true;
					record = 1;
					const text = yield* readValueFx(yield* readSignificantByteFx());
					return {
						type: TypeEnumSchema.enum.office,
						location: `${path}#/kancelar`,
						record,
						text,
					};
				}
				if (key !== "klienti" || clientsSeen)
					return yield* invalidFx("Unknown or repeated document property.");
				clientsSeen = true;
				yield* expectFx(91);
				arrayOpen = true;
				firstItem = true;
				return null;
			});

			const pull = Effect.fnUntraced(function* (): Effect.fn.Return<
				readonly [
					SourceValueSchema.Type,
				],
				ReadError | Cause.Done<void>
			> {
				if (!initialized) {
					yield* expectFx(invoices ? 91 : 123);
					initialized = true;
					arrayOpen = invoices;
				}
				while (true) {
					if (arrayOpen) {
						record = arrayRecord + 1;
						const text = yield* nextArrayValueFx();
						if (text !== null) {
							arrayRecord += 1;
							return [
								{
									type: arrayType,
									location: arrayLocation,
									record,
									text,
								},
							];
						}
					}
					if (invoices) {
						yield* finishFx();
						return yield* Cause.done();
					}
					const office = yield* readClientPropertyFx();
					if (office !== null)
						return [
							office,
						];
				}
			});
			return Stream.fromPull(Effect.succeed(pull()));
		}),
	);
