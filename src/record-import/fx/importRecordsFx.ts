import { formatCauseFn } from "~/text-output/fn/formatCauseFn";
import { formatProblemFn } from "~/record-validation/fn/formatProblemFn";
import { Effect, Stream } from "effect";
import { match } from "ts-pattern";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { validateRecordFx } from "~/accounting-record/fx/validateRecordFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import type { RecordValidationError } from "~/record-validation/error/RecordValidationError";
import type { ProblemSchema } from "~/record-validation/schema/ProblemSchema";
import { StageEnumSchema } from "~/record-validation/schema/StageEnumSchema";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";
import { ExportOptionsSchema } from "~/record-export/schema/ExportOptionsSchema";
import { encodeRecordFx } from "~/record-export/fx/encodeRecordFx";
import type { OutputRecordTooLargeError } from "~/record-export/error/OutputRecordTooLargeError";
import { BestEffortSchema } from "~/record-validation/schema/BestEffortSchema";
import type { BatchSummarySchema } from "~/record-validation/schema/BatchSummarySchema";
import type { IssueSchema } from "~/record-validation/schema/IssueSchema";
import { formatBatchSummaryFn } from "~/record-validation/fn/formatBatchSummaryFn";
import type { PublicationOptionsSchema } from "~/file-publication/schema/PublicationOptionsSchema";
import type { CandidateSchema } from "../schema/CandidateSchema";
import type { ImportResultSchema } from "../schema/ImportResultSchema";
import { ImportRejectedError } from "../error/ImportRejectedError";

interface Props<E, R> {
	readonly records: Stream.Stream<CandidateSchema.Type, E, R>;
	readonly bestEffort: boolean;
	readonly publication: PublicationOptionsSchema.Type;
	readonly exportOptions: ExportOptionsSchema.Type;
}

/** Source-independent validation and publication, preserving each adapter's E/R. */
export const importRecordsFx = Effect.fn("importRecordsFx")(function* <E, R>({
	records,
	bestEffort: inputBestEffort,
	publication: options,
	exportOptions: inputExportOptions,
}: Props<E, R>) {
	const bestEffort = yield* parseRecordFx(BestEffortSchema, inputBestEffort, "batch policy");
	const exportOptions = yield* parseRecordFx(
		ExportOptionsSchema,
		inputExportOptions,
		"record export options",
	);
	const log = yield* ProcessingLog;
	let accepted = 0;
	let rejected = 0;
	let nextProgress = 1000;
	const operation = "record-import";
	const summaryFn = (): BatchSummarySchema.Type => ({
		bestEffort,
		records: accepted,
		rejectedRecords: rejected,
		reviewRequired: rejected > 0,
	});
	yield* log.writeFx({
		operation,
		phase: "started",
		message: `${options.output}; mode: ${bestEffort ? "best-effort" : "strict"}`,
	});

	const logRejectionFx = Effect.fnUntraced(function* (
		error: RecordValidationError | OutputRecordTooLargeError,
		candidate: CandidateSchema.Type,
		stage: StageEnumSchema.Type,
		record: IntermediateRecordSchema.Type | null,
	): Effect.fn.Return<null, RecordValidationError | OutputRecordTooLargeError> {
		rejected += 1;
		const issues = match(error)
			.with(
				{
					_tag: "RecordValidationError",
				},
				({ issues }) =>
					issues.map((issue) => ({
						path: issue.path.map(String),
						code: issue.code,
						message: issue.message,
					})),
			)
			.with(
				{
					_tag: "OutputRecordTooLargeError",
				},
				(error): IssueSchema.Type[] => [
					{
						path: [],
						code: "too_big",
						message: error.message,
					},
				],
			)
			.exhaustive();
		for (const issue of issues) {
			const problem = {
				input: candidate.input,
				position: candidate.position,
				stage,
				source: record?.source ?? null,
				type: record?.type ?? null,
				issue,
			} satisfies ProblemSchema.Type;
			yield* log
				.writeFx({
					operation,
					phase: "failed",
					message: formatProblemFn(problem),
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
	): Effect.fn.Return<Uint8Array | null, RecordValidationError | OutputRecordTooLargeError> {
		let stage: StageEnumSchema.Type = StageEnumSchema.enum.intermediate;
		let intermediate: IntermediateRecordSchema.Type | null = null;
		return yield* Effect.gen(function* () {
			intermediate = yield* parseRecordFx(
				IntermediateRecordSchema,
				candidate.value,
				`${candidate.input}:${candidate.position}`,
			);
			stage = StageEnumSchema.enum.domain;
			const record = yield* validateRecordFx(intermediate);
			stage = StageEnumSchema.enum.output;
			const bytes = yield* encodeRecordFx(record, exportOptions);
			accepted += 1;
			return bytes;
		}).pipe(
			Effect.catchTag("RecordValidationError", (error) =>
				logRejectionFx(error, candidate, stage, intermediate),
			),
			Effect.catchTag("OutputRecordTooLargeError", (error) =>
				logRejectionFx(error, candidate, stage, intermediate),
			),
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
		Stream.onEnd(
			Effect.gen(function* () {
				if (rejected > 0 && (!bestEffort || accepted === 0))
					return yield* Effect.fail(
						new ImportRejectedError({
							accepted,
							rejected,
							log: log.path,
						}),
					);
				// Required before commit: omissions cannot be published without their review notice.
				yield* log.writeFx({
					operation,
					phase: "progress",
					message: `Scan complete; ready for publication. ${formatBatchSummaryFn(summaryFn())}`,
				});
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
					message: formatCauseFn(cause),
				})
				.pipe(Effect.ignore),
		),
	);
	yield* log
		.writeFx({
			operation,
			phase: "succeeded",
			message: `${publication.path}; ${formatBatchSummaryFn(summaryFn())}`,
		})
		.pipe(Effect.ignore);
	return {
		...summaryFn(),
		format: exportOptions.format,
		publication,
		log: log.path,
	} satisfies ImportResultSchema.Type;
});
