import { formatCauseFn } from "~/text-output/fn/formatCauseFn";
import { Clock, Crypto, Effect } from "effect";
import { AuditLog } from "../service/AuditLog";
import { OperationSchema } from "../schema/OperationSchema";
import type { EntrySchema } from "../schema/EntrySchema";
import type { ReceiptSchema } from "../schema/ReceiptSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { ProcessingLog } from "~/processing-log/service/ProcessingLog";

/** Persist intent before accessing records; acknowledge a failed post-commit audit separately. */
export const runAuditedFx = Effect.fn("runAuditedFx")(function* <A, E, R>(
	input: OperationSchema.Type,
	work: Effect.Effect<A, E, R>,
	formatResultFn: (result: A) => string = () => "Complete result published.",
) {
	const operation = yield* parseRecordFx(OperationSchema, input, "audit operation");
	const audit = yield* AuditLog;
	const log = yield* ProcessingLog;
	const crypto = yield* Crypto.Crypto;
	const operationId = yield* crypto.randomUUIDv4;
	const writeFx = Effect.fnUntraced(function* (phase: EntrySchema.Type["phase"], detail: string) {
		const now = yield* Clock.currentTimeMillis;
		yield* audit.writeFx({
			...operation,
			operationId,
			phase,
			detail: detail.slice(0, 8192),
			timestamp: new Date(now).toISOString(),
		});
	});
	return yield* Effect.uninterruptibleMask((restoreFx) =>
		Effect.gen(function* () {
			yield* writeFx(
				"started",
				operation.bestEffort
					? "Best-effort requested; caller accepts omitted records and must review the processing log."
					: "Caller-declared identity; strict operation requested.",
			);
			const result = yield* restoreFx(work).pipe(
				Effect.onError((cause) =>
					writeFx("failed", formatCauseFn(cause)).pipe(Effect.ignore),
				),
			);
			const completion = yield* writeFx("succeeded", formatResultFn(result)).pipe(
				Effect.matchEffect({
					onSuccess: () => Effect.succeed("recorded" as const),
					onFailure: (error) =>
						log
							.writeFx({
								operation: "audit-log",
								phase: "failed",
								message: `${error.message} Operation ${operationId} completed; audit completion is unconfirmed.`,
							})
							.pipe(Effect.ignore, Effect.as("unconfirmed" as const)),
				}),
			);
			return {
				result,
				audit: {
					path: audit.path,
					operationId,
					completion,
				} satisfies ReceiptSchema.Type,
			};
		}),
	);
});
