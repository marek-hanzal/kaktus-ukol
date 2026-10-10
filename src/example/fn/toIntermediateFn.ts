import { match } from "ts-pattern";
import { PayloadSchema } from "~/import-record/schema/PayloadSchema";
import { OriginEnumSchema } from "~/import-record/schema/OriginEnumSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { InvoiceTypeEnumSchema } from "~/accounting-record/schema/InvoiceTypeEnumSchema";
import { InvoiceStatusEnumSchema } from "~/accounting-record/schema/InvoiceStatusEnumSchema";
import { InvoiceTypeEnumSchema as SourceInvoiceTypeEnumSchema } from "../schema/InvoiceTypeEnumSchema";
import { InvoiceStatusEnumSchema as SourceInvoiceStatusEnumSchema } from "../schema/InvoiceStatusEnumSchema";
import type { SourceValueSchema } from "../schema/SourceValueSchema";

// Keep unexpected source keys distinct from English output keys, even when their names collide.
const retainUnknownProtocolFieldsFn = (
	fields: Readonly<Record<string, unknown>>,
): Record<string, unknown> =>
	Object.fromEntries(
		Object.entries(fields).map(([key, value]) => [
			`source.${key}`,
			value,
		]),
	);

const supplierFn = (value: unknown): unknown => {
	const object = PayloadSchema.safeParse(value);
	if (!object.success) return value;
	const { nazev, ico, dic, ulice, mesto, psc, stat, ...unmapped } = object.data;
	return {
		...retainUnknownProtocolFieldsFn(unmapped),
		name: nazev,
		registrationNumber: ico,
		taxNumber: dic,
		street: ulice,
		city: mesto,
		postalCode: psc,
		country: stat,
	};
};

const buyerFn = (value: unknown): unknown => {
	const object = PayloadSchema.safeParse(value);
	if (!object.success) return value;
	const { nazev, ico, ...unmapped } = object.data;
	return {
		...retainUnknownProtocolFieldsFn(unmapped),
		name: nazev,
		registrationNumber: ico,
	};
};

const vatFn = (value: unknown): unknown => {
	if (!Array.isArray(value)) return value;
	return value.map((line: unknown) => {
		const object = PayloadSchema.safeParse(line);
		if (!object.success) return line;
		const { sazba, zaklad, dph, ...unmapped } = object.data;
		return {
			...retainUnknownProtocolFieldsFn(unmapped),
			rate: sazba,
			base: zaklad,
			tax: dph,
		};
	});
};

/** Translate the exact source protocol; incomplete values and unknown fields reach domain diagnostics. */
export const toIntermediateFn = (source: SourceValueSchema.Type, value: unknown): unknown => {
	const object = PayloadSchema.safeParse(value);
	let kaktus: unknown;
	const data = !object.success
		? value
		: match(source.type)
				.with(TypeEnumSchema.enum.office, () => {
					const { id, nazev, ...unmapped } = object.data;
					return {
						...retainUnknownProtocolFieldsFn(unmapped),
						id,
						name: nazev,
					};
				})
				.with(TypeEnumSchema.enum.client, () => {
					const { klientId, nazev, ico, kaktusFirma, ...unmapped } = object.data;
					// A missing mapping remains invalid metadata rather than becoming an invented target.
					kaktus = {
						companyId: kaktusFirma,
					};
					return {
						...retainUnknownProtocolFieldsFn(unmapped),
						id: klientId,
						name: nazev,
						registrationNumber: ico,
					};
				})
				.with(TypeEnumSchema.enum.invoice_request, () => {
					const {
						id,
						klientId,
						typ,
						stav,
						cisloDokladu,
						variabilniSymbol,
						dodavatel,
						odberatel,
						datumVystaveni,
						duzp,
						datumSplatnosti,
						rozpisDph,
						celkem,
						mena,
						kurz,
						popis,
						...unmapped
					} = object.data;
					return {
						...retainUnknownProtocolFieldsFn(unmapped),
						id,
						clientId: klientId,
						type:
							typ === SourceInvoiceTypeEnumSchema.enum.faktura_prijata
								? InvoiceTypeEnumSchema.enum.received_invoice
								: typ,
						status:
							stav === SourceInvoiceStatusEnumSchema.enum.schvaleno
								? InvoiceStatusEnumSchema.enum.approved
								: stav,
						number: cisloDokladu,
						variableSymbol: variabilniSymbol,
						supplier: supplierFn(dodavatel),
						buyer: buyerFn(odberatel),
						issuedOn: datumVystaveni,
						taxableOn: duzp,
						dueOn: datumSplatnosti,
						vat: vatFn(rozpisDph),
						total: celkem,
						currency: mena,
						exchangeRate: kurz,
						description: popis,
					};
				})
				.exhaustive();
	return {
		type: source.type,
		source: {
			origin: OriginEnumSchema.enum.example,
			location: source.location,
			record: source.record,
		},
		kaktus,
		data,
	};
};
