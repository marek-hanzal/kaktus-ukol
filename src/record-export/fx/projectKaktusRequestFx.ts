import { BigDecimal, Effect } from "effect";
import { match } from "ts-pattern";
import type { ClientRecordSchema } from "~/accounting-record/schema/ClientRecordSchema";
import type { CompanyRecordSchema } from "~/accounting-record/schema/CompanyRecordSchema";
import type { InvoiceRequestRecordSchema } from "~/accounting-record/schema/InvoiceRequestRecordSchema";
import { formatDecimalFn } from "~/accounting-value/fn/formatDecimalFn";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { RecordValidationError } from "~/record-validation/error/RecordValidationError";
import { KaktusInvoiceSchema } from "../schema/KaktusInvoiceSchema";

/** Resolve the write request without inventing readback IDs or rounding its amounts. */
export const projectKaktusRequestFx = Effect.fnUntraced(function* (
	request: InvoiceRequestRecordSchema.Type,
	client: ClientRecordSchema.Type,
	company: CompanyRecordSchema.Type,
) {
	const data = request.data;
	const reject = (field: string, message: string) =>
		Effect.fail(
			new RecordValidationError({
				schemaId: "record-export.KaktusInvoiceSchema",
				source: `${request.source.location}#${request.source.record}`,
				issues: [
					{
						code: "custom",
						path: [
							field,
						],
						message,
					},
				],
			}),
		);
	if (client.data.id !== data.clientId || client.kaktus?.companyId !== company.data.id)
		return yield* reject("clientId", "Client does not resolve to this target company");
	if (
		data.buyer.registrationNumber !== client.data.registrationNumber ||
		client.data.registrationNumber !== company.data.registrationNumber
	)
		return yield* reject(
			"buyer.registrationNumber",
			"Buyer, client and live target company must have the same registration number",
		);
	if (request.kaktus?.companyId !== undefined && request.kaktus.companyId !== company.data.id)
		return yield* reject(
			"kaktus.companyId",
			"Request metadata conflicts with the client route",
		);
	const zero = BigDecimal.fromBigInt(0n);
	let base0 = zero;
	let base12 = zero;
	let tax12 = zero;
	let base21 = zero;
	let tax21 = zero;
	for (const line of data.vat) {
		if (line.rate === 0 && !BigDecimal.equals(line.tax, zero))
			return yield* reject("vat", "Zero-rate VAT must have zero tax");
		match(line.rate)
			.with(0, () => {
				base0 = BigDecimal.sum(base0, line.base);
			})
			.with(12, () => {
				base12 = BigDecimal.sum(base12, line.base);
				tax12 = BigDecimal.sum(tax12, line.tax);
			})
			.with(21, () => {
				base21 = BigDecimal.sum(base21, line.base);
				tax21 = BigDecimal.sum(tax21, line.tax);
			})
			.exhaustive();
	}
	const sum = [
		base0,
		base12,
		tax12,
		base21,
		tax21,
	].reduce(BigDecimal.sum, zero);
	if (!BigDecimal.equals(sum, data.total))
		return yield* reject("total", "Total differs from the exact sum of bases and VAT");
	if (
		data.currency !== "CZK" &&
		(data.exchangeRate === null || !BigDecimal.isPositive(data.exchangeRate))
	)
		return yield* reject("exchangeRate", "Foreign currency requires a positive exchange rate");
	if (
		data.currency === "CZK" &&
		data.exchangeRate !== null &&
		!BigDecimal.equals(data.exchangeRate, BigDecimal.fromBigInt(1n))
	)
		return yield* reject("exchangeRate", "CZK exchange rate must be one or absent");
	return yield* parseRecordFx(
		KaktusInvoiceSchema,
		{
			provenance: {
				companyId: company.data.id,
				requestId: data.id,
				clientId: data.clientId,
				source: {
					origin: request.source.origin,
					location: request.source.location,
					record: request.source.record,
				},
			},
			CisloDodavatele: data.number,
			VarSymbol: data.variableSymbol,
			Dodavatel: {
				Nazev: data.supplier.name,
				ICO: data.supplier.registrationNumber,
				DIC: data.supplier.taxNumber,
				Ulice: data.supplier.street,
				Mesto: data.supplier.city,
				PSC: data.supplier.postalCode,
				Stat: data.supplier.country,
				Ucet: "",
			},
			DatumVystaveni: data.issuedOn,
			DatumZdanPlneni: data.taxableOn,
			DatumSplatnosti: data.dueOn,
			Zaklad0: formatDecimalFn(base0),
			Zaklad12: formatDecimalFn(base12),
			DPH12: formatDecimalFn(tax12),
			Zaklad21: formatDecimalFn(base21),
			DPH21: formatDecimalFn(tax21),
			Celkem: formatDecimalFn(data.total),
			Mena: data.currency,
			Kurz: data.exchangeRate === null ? null : formatDecimalFn(data.exchangeRate),
			Text: data.description,
			Poznamka: "",
		},
		`${request.source.location}#${request.source.record}`,
	);
});
