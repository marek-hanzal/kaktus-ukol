import { Effect, Path, Stream } from "effect";
import type { CandidateSchema } from "~/record-import/schema/CandidateSchema";
import { SourceFileEnumSchema } from "../schema/SourceFileEnumSchema";
import type { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { parseSourceValueFx } from "./parseSourceValueFx";
import { toIntermediateFn } from "../fn/toIntermediateFn";
import { createSourceValuesStreamFx } from "./createSourceValuesStreamFx";

/** Read office, clients and invoice requests sequentially through the shared admission pipeline. */
export const createExampleStreamFx = Effect.fn("createExampleStreamFx")(function* (
	options: ReadOptionsSchema.Type,
) {
	const path = yield* Path.Path;
	const clients = path.join(options.input, "klienti.json");
	const invoices = path.join(options.input, "doklady-k-zapisu.json");
	const values = Stream.unwrap(
		createSourceValuesStreamFx(
			clients,
			SourceFileEnumSchema.enum.clients,
			options.maxRecordBytes,
		),
	).pipe(
		Stream.concat(
			Stream.unwrap(
				createSourceValuesStreamFx(
					invoices,
					SourceFileEnumSchema.enum.invoices,
					options.maxRecordBytes,
				),
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
});
