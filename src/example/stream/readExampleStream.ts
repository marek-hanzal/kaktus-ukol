import { Effect, Path, Stream } from "effect";
import type { CandidateSchema } from "~/record-import/schema/CandidateSchema";
import { SourceFileEnumSchema } from "../schema/SourceFileEnumSchema";
import type { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { parseSourceValueFx } from "../fx/parseSourceValueFx";
import { toIntermediateFn } from "../fn/toIntermediateFn";
import { readSourceValuesStream } from "./readSourceValuesStream";

/** Read office, clients and invoice requests sequentially through the shared admission pipeline. */
export const readExampleStream = (options: ReadOptionsSchema.Type) =>
	Stream.unwrap(
		Effect.gen(function* () {
			const path = yield* Path.Path;
			const clients = path.join(options.input, "klienti.json");
			const invoices = path.join(options.input, "doklady-k-zapisu.json");
			const values = readSourceValuesStream(
				clients,
				SourceFileEnumSchema.enum.clients,
				options.maxRecordBytes,
			).pipe(
				Stream.concat(
					readSourceValuesStream(
						invoices,
						SourceFileEnumSchema.enum.invoices,
						options.maxRecordBytes,
					),
				),
			);
			return values.pipe(
				Stream.mapEffect(
					(source) =>
						parseSourceValueFx(source).pipe(
							Effect.map(
								(value): CandidateSchema.Type => ({
									input: source.type === "invoice_request" ? invoices : clients,
									position: source.record,
									value: toIntermediateFn(source, value),
								}),
							),
						),
					{
						concurrency: 1,
					},
				),
			);
		}),
	);
