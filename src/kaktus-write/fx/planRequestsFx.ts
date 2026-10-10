import { Effect, FileSystem, Path, Stream } from "effect";
import iconv from "iconv-lite";
import { ClientRecordSchema } from "~/accounting-record/schema/ClientRecordSchema";
import { CompanyRecordSchema } from "~/accounting-record/schema/CompanyRecordSchema";
import { readExportSnapshotStream } from "~/kaktus/stream/readExportSnapshotStream";
import { projectKaktusRequestFx } from "~/record-export/fx/projectKaktusRequestFx";
import { printKaktusInvoiceFn } from "~/record-export/fn/printKaktusInvoiceFn";
import { toIntermediateOutputFn } from "~/record-export/fn/toIntermediateOutputFn";
import { appendEntryFx } from "~/file-append/fx/appendEntryFx";
import type { InvoiceRequestRecordSchema } from "~/accounting-record/schema/InvoiceRequestRecordSchema";
import { RequestRejectedError } from "../error/RequestRejectedError";
import { AttemptSchema } from "../schema/AttemptSchema";
import { PlanSchema } from "../schema/PlanSchema";
import type { PlanningSummarySchema } from "../schema/PlanningSummarySchema";
import { businessIdentityFn } from "../fn/businessIdentityFn";
import { hashValueFx } from "./hashValueFx";
import { readStoredValueFx } from "./readStoredValueFx";
import { recordOutcomeFx } from "./recordOutcomeFx";
import { storeValueFx } from "./storeValueFx";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";

/** Complete write admission precedes any target side effects. */
export const planRequestsFx = Effect.fn("planRequestsFx")(function* (
	run: string,
	state: string,
	initialRejected: number,
) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const summary: PlanningSummarySchema.Type = {
		planned: 0,
		rejected: initialRejected,
		alreadyWritten: 0,
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
		const companyFile = path.join(run, `company-${companyId}.json`);
		if (!(yield* fs.exists(companyFile)))
			return yield* reject("unknown_company", `Target company ${companyId} does not exist`);
		const company = yield* readStoredValueFx(companyFile, CompanyRecordSchema);
		if (company.data.folder !== companyId)
			return yield* reject(
				"unsupported_target_folder",
				"Simulator requires DATA/<company ID>; refusing a conflicting FIRMY route",
			);
		const invoice = yield* projectKaktusRequestFx(request, client, company);
		const fingerprint = yield* hashValueFx([
			companyId,
			toIntermediateOutputFn(request).data,
		]);
		const requestKey = yield* hashValueFx(request.data.id);
		const businessKey = yield* hashValueFx(
			businessIdentityFn(
				companyId,
				invoice.CisloDodavatele,
				invoice.Dodavatel.ICO,
				invoice.Dodavatel.Nazev,
			),
		);
		const requestState = path.join(state, `request-${requestKey}.json`);
		if (yield* fs.exists(requestState)) {
			const previous = yield* readStoredValueFx(requestState, AttemptSchema);
			if (previous.fingerprint !== fingerprint)
				return yield* reject(
					"immutable_request",
					"Previously admitted request has different business values; replacement is forbidden",
				);
			if (previous.status === "intent")
				return yield* reject(
					"unconfirmed_previous_attempt",
					`Previous write may have committed; reconcile ${previous.run} before retrying`,
				);
			if (previous.status === "written") {
				summary.alreadyWritten += 1;
				yield* recordOutcomeFx(run, {
					source: request.source,
					requestId: request.data.id,
					companyId,
					status: "already_written",
					code: "confirmed_previous_write",
					detail: "Identical request already has a confirmed Kaktus response; no new write",
					documentNumber: previous.documentNumber,
				});
				return;
			}
		}
		const businessState = path.join(state, `business-${businessKey}.json`);
		if (yield* fs.exists(businessState)) {
			const previous = yield* readStoredValueFx(businessState, AttemptSchema);
			if (previous.status !== "rejected")
				return yield* reject(
					"previous_business_attempt",
					`Business identity has a ${previous.status} attempt in ${previous.run}; no automatic resubmission`,
				);
		}
		if (yield* fs.exists(path.join(run, `existing-${businessKey}.json`)))
			return yield* reject(
				"existing_invoice",
				"Supplier and supplier invoice number already exist in this company; no implicit upsert",
			);
		const seen = path.join(run, `planned-business-${businessKey}.json`);
		if (yield* fs.exists(seen))
			return yield* reject(
				"duplicate_input",
				"Another request has the same company, supplier and invoice number",
			);
		if (iconv.encode(printKaktusInvoiceFn(invoice), "windows-1250").byteLength > 64 * 1024)
			return yield* reject("output_too_large", "Encoded XML invoice exceeds 64 KiB");
		const plan = yield* parseRecordFx(
			PlanSchema,
			{
				requestId: request.data.id,
				companyId,
				source: request.source,
				fingerprint,
				requestKey,
				businessKey,
				invoice,
			},
			"write plan",
		);
		yield* storeValueFx(seen, request.data.id);
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
