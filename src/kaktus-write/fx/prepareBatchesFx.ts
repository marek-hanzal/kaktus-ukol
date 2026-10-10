import { Effect, Path, Stream } from "effect";
import iconv from "iconv-lite";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";
import { printKaktusInvoiceFn } from "~/record-export/fn/printKaktusInvoiceFn";
import { readBatchesStream } from "../stream/readBatchesStream";

/** Prepare the complete sibling XML set before the first external mutation. */
export const prepareBatchesFx = Effect.fn("prepareBatchesFx")(function* (run: string) {
	const path = yield* Path.Path;
	let sequence = 0;
	yield* readBatchesStream(path.join(run, "plan.ndjson")).pipe(
		Stream.runForEach((batch) =>
			Effect.gen(function* () {
				const first = batch[0];
				if (first === undefined) return;
				sequence += 1;
				const xml = path.join(run, `batch-${sequence}-${first.companyId}.xml`);
				const header = `<?xml version="1.0" encoding="windows-1250"?>\r\n<KaktusDavka verze="3.2" firma="${first.companyId}">\r\n`;
				yield* publishFileFx({
					options: {
						output: xml,
						maxChunkBytes: 64 * 1024,
					},
					content: Stream.fromIterable([
						header,
						...batch.map((plan) => printKaktusInvoiceFn(plan.invoice)),
						"</KaktusDavka>\r\n",
					]).pipe(Stream.map((value) => iconv.encode(value, "windows-1250"))),
				});
			}),
		),
	);
	return sequence;
});
