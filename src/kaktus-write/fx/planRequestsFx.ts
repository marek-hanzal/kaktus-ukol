import { Effect, FileSystem, Path, Stream } from "effect";
import { match } from "ts-pattern";
import iconv from "iconv-lite";
import { ClientRecordSchema } from "~/accounting-record/schema/ClientRecordSchema";
import { CompanyRecordSchema } from "~/accounting-record/schema/CompanyRecordSchema";
import { readExportSnapshotStream } from "~/kaktus/stream/readExportSnapshotStream";
import { projectKaktusRequestFx } from "~/record-export/fx/projectKaktusRequestFx";
import { printKaktusInvoiceFn } from "~/record-export/fn/printKaktusInvoiceFn";
import { appendEntryFx } from "~/file-append/fx/appendEntryFx";
import type { InvoiceRequestRecordSchema } from "~/accounting-record/schema/InvoiceRequestRecordSchema";
import { RequestRejectedError } from "../error/RequestRejectedError";
import { WriteError } from "../error/WriteError";
import { PlanSchema } from "../schema/PlanSchema";
import type { PlanningSummarySchema } from "../schema/PlanningSummarySchema";
import { businessIdentityFn } from "../fn/businessIdentityFn";
import { hashValueFx } from "./hashValueFx";
import { readStoredValueFx } from "./readStoredValueFx";
import { recordOutcomeFx } from "./recordOutcomeFx";
import { storeValueFx } from "./storeValueFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { compareTargetFx } from "./compareTargetFx";
import { formatTargetComparisonFn } from "../fn/formatTargetComparisonFn";

/** Complete write admission precedes any target side effects. */
export const planRequestsFx = Effect.fn("planRequestsFx")(function* (
	run: string,
	inventory: string,
	initialRejected: number,
) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const summary: PlanningSummarySchema.Type = {
		planned: 0,
		rejected: initialRejected,
		alreadyPresent: 0,
	};
	yield* fs.writeFileString(path.join(run, "plan.ndjson"), "");
	const reject = (code: string, detail: string) =>
		Effect.fail(
			new RequestRejectedError({
				code,
				detail,
			}),
		);
	const planFx = Effect.fnUntraced(function* (
		request: InvoiceRequestRecordSchema.Type,
		routeFn: (companyId: string) => void,
	) {
		const clientFile = path.join(run, `client-${request.data.clientId}.json`);
		if (!(yield* fs.exists(clientFile)))
			return yield* reject(
				"unknown_client",
				`No client mapping for ${request.data.clientId}`,
			);
		const client = yield* readStoredValueFx(clientFile, ClientRecordSchema);
		const companyId = client.kaktus?.companyId;
		if (companyId === undefined)
			return yield* reject("invalid_route", "Client has no target company");
		routeFn(companyId);
		const companyFile = path.join(inventory, `company-${companyId}.json`);
		if (!(yield* fs.exists(companyFile)))
			return yield* reject("unknown_company", `Target company ${companyId} does not exist`);
		const company = yield* readStoredValueFx(companyFile, CompanyRecordSchema);
		if (company.data.folder !== companyId)
			return yield* reject(
				"unsupported_target_folder",
				"Simulator requires DATA/<company ID>; refusing a conflicting FIRMY route",
			);
		const invoice = yield* projectKaktusRequestFx(request, client, company);
		const businessKey = yield* hashValueFx(
			businessIdentityFn(
				companyId,
				invoice.CisloDodavatele,
				invoice.Dodavatel.ICO,
				invoice.Dodavatel.Nazev,
			),
		);
		const seen = path.join(run, `planned-business-${businessKey}.json`);
		if (yield* fs.exists(seen))
			return yield* reject(
				"duplicate_input",
				"Another request has the same company, supplier and invoice number",
			);
		yield* storeValueFx(seen, request.data.id);
		const comparison = yield* compareTargetFx(inventory, businessKey, invoice);
		const missing = yield* match(comparison.status)
			.with("missing", () => Effect.succeed(true))
			.with("present", () =>
				Effect.gen(function* () {
					summary.alreadyPresent += 1;
					yield* recordOutcomeFx(run, {
						source: request.source,
						requestId: request.data.id,
						companyId,
						status: "already_present",
						code: "ALREADY_PRESENT",
						detail: formatTargetComparisonFn(comparison),
						documentNumber: comparison.documentNumber,
					});
					return false;
				}),
			)
			.with("conflict", () => reject("target_conflict", formatTargetComparisonFn(comparison)))
			.with("ambiguous", () =>
				Effect.fail(
					new WriteError({
						detail: formatTargetComparisonFn(comparison),
					}),
				),
			)
			.exhaustive();
		if (!missing) return;
		if (iconv.encode(printKaktusInvoiceFn(invoice), "windows-1250").byteLength > 64 * 1024)
			return yield* reject("output_too_large", "Encoded XML invoice exceeds 64 KiB");
		const plan = yield* parseRecordFx(
			PlanSchema,
			{
				requestId: request.data.id,
				companyId,
				source: request.source,
				businessKey,
				invoice,
			},
			"write plan",
		);
		yield* appendEntryFx(
			path.join(run, "plan.ndjson"),
			`${JSON.stringify(plan)}\n`,
			1024 * 1024,
		);
		summary.planned += 1;
	});
	yield* readExportSnapshotStream(path.join(run, "requests.ndjson")).pipe(
		Stream.runForEach((record) => {
			if (record.type !== "invoice_request") return Effect.void;
			let companyId: string | null = null;
			return planFx(record, (id) => {
				companyId = id;
			}).pipe(
				Effect.catchTags({
					RequestRejectedError: (error) =>
						Effect.gen(function* () {
							summary.rejected += 1;
							yield* recordOutcomeFx(run, {
								source: record.source,
								requestId: record.data.id,
								companyId,
								status: "rejected",
								code: error.code,
								detail: error.detail,
								documentNumber: null,
							});
						}),
					RecordValidationError: (error) =>
						Effect.gen(function* () {
							summary.rejected += 1;
							yield* recordOutcomeFx(run, {
								source: record.source,
								requestId: record.data.id,
								companyId,
								status: "rejected",
								code: "invalid_target_projection",
								detail: error.message,
								documentNumber: null,
							});
						}),
				}),
			);
		}),
	);
	return summary;
});
