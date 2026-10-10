import { Effect, FileSystem, Path, Stream } from "effect";
import { match } from "ts-pattern";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { validateRecordFx } from "~/accounting-record/fx/validateRecordFx";
import { encodeRecordFx } from "~/record-export/fx/encodeRecordFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { createIntermediateStreamFx } from "~/record-import/fx/createIntermediateStreamFx";
import { appendEntryFx } from "~/file-append/fx/appendEntryFx";
import type { WriteOptionsSchema } from "../schema/WriteOptionsSchema";
import { WriteError } from "../error/WriteError";
import { hashValueFx } from "./hashValueFx";
import { recordOutcomeFx } from "./recordOutcomeFx";

/** Snapshot routing before requests so native exchange is independent of input order. */
export const prepareRequestsFx = Effect.fn("prepareRequestsFx")(function* (
	options: WriteOptionsSchema.Type,
	run: string,
) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const requests = path.join(run, "requests.ndjson");
	yield* fs.writeFileString(requests, "");
	let offices = 0;
	let rejected = 0;
	yield* Stream.unwrap(
		createIntermediateStreamFx({
			path: options.input,
			maxRecordBytes: options.maxRecordBytes,
			chunkBytes: 16 * 1024,
		}),
	).pipe(
		Stream.runForEach((candidate) =>
			Effect.gen(function* () {
				const envelope = yield* parseRecordFx(
					IntermediateRecordSchema,
					candidate.value,
					`${candidate.input}#${candidate.position}`,
				);
				if (envelope.type === "invoice_request" && typeof envelope.data.id === "string") {
					const key = yield* hashValueFx(envelope.data.id);
					const marker = path.join(run, `source-request-${key}`);
					if (yield* fs.exists(marker))
						return yield* Effect.fail(
							new WriteError({
								detail: `Repeated invoice request identity ${envelope.data.id}; nothing may be sent.`,
							}),
						);
					yield* fs.writeFileString(marker, "");
				}
				const record = yield* validateRecordFx(envelope).pipe(
					Effect.catchTag("RecordValidationError", (error) =>
						Effect.gen(function* () {
							if (envelope.type !== "invoice_request")
								return yield* Effect.fail(error);
							rejected += 1;
							yield* recordOutcomeFx(run, {
								source: envelope.source,
								requestId:
									typeof envelope.data.id === "string" ? envelope.data.id : null,
								companyId: null,
								status: "rejected",
								code: "invalid_request",
								detail: error.message,
								documentNumber: null,
							});
							return null;
						}),
					),
				);
				if (record === null) return;
				yield* match(record)
					.with(
						{
							type: "office",
						},
						() =>
							Effect.sync(() => {
								offices += 1;
							}),
					)
					.with(
						{
							type: "client",
						},
						(client) =>
							Effect.gen(function* () {
								const target = path.join(run, `client-${client.data.id}.json`);
								if (yield* fs.exists(target))
									return yield* Effect.fail(
										new WriteError({
											detail: `Repeated client identity ${client.data.id}`,
										}),
									);
								yield* fs.writeFile(
									target,
									yield* encodeRecordFx(client, {
										format: "intermediate",
										maxRecordBytes: 1024 * 1024,
									}),
								);
							}),
					)
					.with(
						{
							type: "invoice_request",
						},
						(request) =>
							Effect.gen(function* () {
								const bytes = yield* encodeRecordFx(request, {
									format: "intermediate",
									maxRecordBytes: 1024 * 1024,
								});
								yield* appendEntryFx(
									requests,
									new TextDecoder().decode(bytes),
									1024 * 1024 + 1,
								);
							}),
					)
					.with(
						{
							type: "company",
						},
						{
							type: "supplier",
						},
						{
							type: "received_invoice",
						},
						() => Effect.void,
					)
					.exhaustive();
			}),
		),
	);
	if (offices !== 1)
		return yield* Effect.fail(
			new WriteError({
				detail: `Expected one office record, found ${offices}; routing is not admitted.`,
			}),
		);
	return rejected;
});
