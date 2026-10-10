import { Cause, Effect, Stream } from "effect";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import type { RecordSchema } from "~/accounting-record/schema/RecordSchema";
import { validateRecordFx } from "~/accounting-record/fx/validateRecordFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import type { RecordValidationError } from "~/record-validation/error/RecordValidationError";
import type { ProblemSchema } from "~/record-validation/schema/ProblemSchema";
import { StageEnumSchema } from "~/record-validation/schema/StageEnumSchema";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";
import type { PublicationOptionsSchema } from "~/file-publication/schema/PublicationOptionsSchema";
import type { CandidateSchema } from "../schema/CandidateSchema";
import type { ImportSummarySchema } from "../schema/ImportSummarySchema";
import { ImportRejectedError } from "../error/ImportRejectedError";

interface Props<E, R> {
	readonly records: Stream.Stream<CandidateSchema.Type, E, R>;
	readonly publication: PublicationOptionsSchema.Type;
}

/** Source-independent validation and publication, preserving each adapter's E/R. */
export const importRecordsFx = Effect.fn("importRecordsFx")(function* <E, R>({
	records,
	publication: options,
}: Props<E, R>) {
	const log = yield* ProcessingLog;
	let accepted = 0;
	let rejected = 0;
	let nextProgress = 1000;
	const encoder = new TextEncoder();
	const operation = "record-import";
	yield* log.writeFx({
		operation,
		phase: "started",
		message: options.output,
	});

	const logRejectionFx = Effect.fnUntraced(function* (
		error: RecordValidationError,
		candidate: CandidateSchema.Type,
		stage: StageEnumSchema.Type,
		record: IntermediateRecordSchema.Type | null,
	): Effect.fn.Return<null, RecordValidationError> {
		rejected += 1;
		for (const issue of error.issues) {
			const problem = {
				input: candidate.input,
				position: candidate.position,
				stage,
				source: record?.source ?? null,
				type: record?.type ?? null,
				issue: {
					path: issue.path.map(String),
					code: issue.code,
					message: issue.message,
				},
			} satisfies ProblemSchema.Type;
			yield* log
				.writeFx({
					operation,
					phase: "failed",
					message: JSON.stringify(problem),
				})
				.pipe(
					// Preserve the actual rejection if its diagnostic cannot be written.
					Effect.catchTag("ProcessingLogError", () => Effect.fail(error)),
				);
		}
		return null;
	});

	const processRecordFx = Effect.fnUntraced(function* (
		candidate: CandidateSchema.Type,
	): Effect.fn.Return<RecordSchema.Type | null, RecordValidationError> {
		let stage: StageEnumSchema.Type = StageEnumSchema.enum.intermediate;
		let intermediate: IntermediateRecordSchema.Type | null = null;
		return yield* Effect.gen(function* () {
			intermediate = yield* parseRecordFx(
				IntermediateRecordSchema,
				candidate.value,
				`${candidate.input}:${candidate.position}`,
			);
			stage = StageEnumSchema.enum.domain;
			return yield* validateRecordFx(intermediate);
		}).pipe(
			Effect.matchEffect({
				onFailure: (error) => logRejectionFx(error, candidate, stage, intermediate),
				onSuccess: (record) =>
					Effect.sync(() => {
						accepted += 1;
						return record;
					}),
			}),
		);
	});

	const content = records.pipe(
		Stream.mapEffect(processRecordFx, {
			concurrency: 1,
		}),
		Stream.tap(() =>
			Effect.suspend(() => {
				const processed = accepted + rejected;
				if (processed < nextProgress) return Effect.void;
				nextProgress = processed + 1000;
				return log.writeFx({
					operation,
					phase: "progress",
					message: `${processed} records processed: ${accepted} accepted, ${rejected} rejected`,
				});
			}),
		),
		Stream.filter((record) => record !== null),
		Stream.map((record) => encoder.encode(`${JSON.stringify(record)}\n`)),
		Stream.onEnd(
			Effect.suspend(() => {
				if (rejected > 0)
					return Effect.fail(
						new ImportRejectedError({
							accepted,
							rejected,
							log: log.path,
						}),
					);
				return Effect.void;
			}),
		),
	);
	const publication = yield* publishFileFx({
		content,
		options,
	}).pipe(
		Effect.onError((cause) =>
			log
				.writeFx({
					operation,
					phase: "failed",
					message: Cause.pretty(cause),
				})
				.pipe(Effect.ignore),
		),
	);
	yield* log
		.writeFx({
			operation,
			phase: "succeeded",
			message: `${accepted} validated records published to ${publication.path}`,
		})
		.pipe(Effect.ignore);
	return {
		records: accepted,
		publication,
		log: log.path,
	} satisfies ImportSummarySchema.Type;
});
