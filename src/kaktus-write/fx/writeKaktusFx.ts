import { Crypto, Effect, FileSystem, Path, Stream } from "effect";
import { runAuditedFx } from "~/audit-log/fx/runAuditedFx";
import { checkDataPathsFx } from "~/file-boundary/fx/checkDataPathsFx";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";
import { formatCauseFn } from "~/text-output/fn/formatCauseFn";
import { escapeLineFn } from "~/text-output/fn/escapeLineFn";
import { WriteOptionsSchema } from "../schema/WriteOptionsSchema";
import type { WriteSummarySchema } from "../schema/WriteSummarySchema";
import { WriteError } from "../error/WriteError";
import { formatWriteSummaryFn } from "../fn/formatWriteSummaryFn";
import { hashValueFx } from "./hashValueFx";
import { storeValueFx } from "./storeValueFx";
import { indexTargetFx } from "./indexTargetFx";
import { prepareRequestsFx } from "./prepareRequestsFx";
import { planRequestsFx } from "./planRequestsFx";
import { prepareBatchesFx } from "./prepareBatchesFx";
import { executePlanFx } from "./executePlanFx";

/** Submit native intermediate requests through the vendor simulator, never direct DBF writes. */
export const writeKaktusFx = Effect.fn("writeKaktusFx")(function* (input: WriteOptionsSchema.Type) {
	const options = yield* parseRecordFx(WriteOptionsSchema, input, "Kaktus write options");
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const log = yield* ProcessingLog;
	const crypto = yield* Crypto.Crypto;
	const simulator = yield* fs.realPath(path.resolve(options.simulator));
	const data = yield* fs.realPath(path.join(path.dirname(simulator), "DATA"));
	const state = path.resolve(options.state);
	const output = path.resolve(options.output);
	yield* checkDataPathsFx(
		[
			options.input,
			data,
		],
		output,
		true,
	);
	yield* checkDataPathsFx(
		[
			simulator,
		],
		output,
	);
	yield* checkDataPathsFx(
		[
			options.input,
			data,
			simulator,
		],
		path.join(state, "boundary-probe"),
		true,
	);
	yield* checkDataPathsFx(
		[
			state,
		],
		output,
		true,
	);
	const audited = yield* runAuditedFx(
		{
			actor: options.actor,
			bestEffort: options.bestEffort,
			action: "write_kaktus",
			inputs: [
				path.resolve(options.input),
				simulator,
				data,
			],
			output,
		},
		Effect.scoped(
			Effect.gen(function* () {
				yield* fs.makeDirectory(state, {
					recursive: true,
				});
				const lock = path.join(state, "writer.lock");
				yield* Effect.acquireRelease(
					fs.makeDirectory(lock).pipe(
						Effect.mapError((error) =>
							error.reason._tag === "AlreadyExists"
								? new WriteError({
										detail: `Writer lock exists: ${lock}. Review the previous run before manually removing a stale lock; no automatic takeover.`,
									})
								: error,
						),
					),
					() =>
						fs
							.remove(lock, {
								recursive: true,
							})
							.pipe(Effect.ignore),
				);
				const target = path.join(
					state,
					yield* hashValueFx([
						simulator,
						data,
					]),
				);
				yield* fs.makeDirectory(target, {
					recursive: true,
				});
				const run = path.join(target, "runs", yield* crypto.randomUUIDv4);
				yield* fs.makeDirectory(run, {
					recursive: true,
				});
				yield* storeValueFx(path.join(lock, "owner.json"), {
					run,
					actor: options.actor,
				});
				yield* storeValueFx(path.join(run, "invocation.json"), {
					...options,
					simulator,
					data,
					output,
				});
				yield* fs.writeFileString(path.join(run, "outcomes.txt"), "");
				yield* log.writeFx({
					operation: "kaktus-write",
					phase: "started",
					message: `Run ${run}; caller accepts ${options.bestEffort ? "best-effort omissions and mandatory review" : "strict local admission"}`,
				});
				const rejected = yield* prepareRequestsFx(
					{
						...options,
						simulator,
					},
					run,
				);
				yield* indexTargetFx(data, run, options);
				const planning = yield* planRequestsFx(run, target, rejected);
				yield* log.writeFx({
					operation: "kaktus-write",
					phase: "progress",
					message: `Admission complete: ${planning.planned} ready, ${planning.rejected} rejected, ${planning.alreadyWritten} already written.${planning.rejected > 0 ? " REVIEW REQUIRED." : ""}`,
				});
				const batches = yield* prepareBatchesFx(run);
				yield* log.writeFx({
					operation: "kaktus-write",
					phase: "progress",
					message: `Prepared ${batches} XML files; each contains one company and at most 20 invoices. All files are ready before target execution.`,
				});
				const summary = yield* executePlanFx(
					{
						...options,
						simulator,
					},
					run,
					target,
					data,
					planning,
				);
				const header = `${formatWriteSummaryFn(summary)}\nRun evidence: ${escapeLineFn(run)}\n\n`;
				yield* log.writeFx({
					operation: "kaktus-write",
					phase: "progress",
					message: formatWriteSummaryFn(summary),
				});
				const publication = yield* publishFileFx({
					options: {
						output,
						maxChunkBytes: 64 * 1024,
					},
					content: Stream.make(new TextEncoder().encode(header)).pipe(
						Stream.concat(
							fs.stream(path.join(run, "outcomes.txt"), {
								chunkSize: 16 * 1024,
							}),
						),
					),
				});
				return {
					...summary,
					publication,
					run,
					log: log.path,
				};
			}),
		).pipe(
			Effect.onError((cause) =>
				log
					.writeFx({
						operation: "kaktus-write",
						phase: "failed",
						message: formatCauseFn(cause),
					})
					.pipe(Effect.ignore),
			),
		),
		formatWriteSummaryFn,
	);
	return {
		...audited.result,
		audit: audited.audit,
	} satisfies WriteSummarySchema.Type;
});
