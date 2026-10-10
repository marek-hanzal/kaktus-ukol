import { Effect, Stream } from "effect";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";
/** Durable replacement is also used for request intents and confirmations. */
export const storeValueFx = Effect.fnUntraced(function* (output: string, value: unknown) {
	return yield* publishFileFx({
		options: {
			output,
			maxChunkBytes: 2 * 1024 * 1024,
		},
		content: Stream.make(`${JSON.stringify(value)}\n`).pipe(Stream.encodeText),
	});
});
