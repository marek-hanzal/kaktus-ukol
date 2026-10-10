import { match } from "ts-pattern";
import type { RowSchema } from "~/dbf/schema/RowSchema";
import type { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import { OriginEnumSchema } from "~/import-record/schema/OriginEnumSchema";

const nullableTextFn = (value: string | undefined): string | null | undefined =>
	value === "" ? null : value;

/** Agreed source policy: numeric N(8) ICO loses leading zeroes, so restore its eight-digit spelling. */
const numericRegistrationNumberFn = (value: string | undefined): string | null | undefined => {
	if (value !== undefined && /^\d{1,8}$/.test(value)) return value.padStart(8, "0");
	return nullableTextFn(value);
};

// Only integer identifiers cross into JS numbers. Malformed/unsafe values reach domain validation unchanged.
const integerFn = (value: string | undefined): unknown => {
	if (value === undefined || !/^\d+$/.test(value)) return value;
	const number = Number(value);
	return Number.isSafeInteger(number) ? number : value;
};

const dateFn = (value: string | undefined): string | null | undefined => {
	if (value === "") return null;
	if (value === undefined || !/^\d{8}$/.test(value)) return value;
	return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
};

const logicalFn = (value: string | undefined): unknown =>
	match(value)
		.with("T", "t", "Y", "y", () => true)
		.with("F", "f", "N", "n", () => false)
		.with("", "?", () => null)
		.otherwise((value) => value);

/** Explicit protocol projection; business values remain untrusted until accounting admission. */
export const toIntermediateFn = (
	row: RowSchema.Type,
	type: TypeEnumSchema.Type,
	location: string,
	companyId: string | null,
): IntermediateRecordSchema.Type => {
	const field = row.fields;
	const data = match(type)
		.with(TypeEnumSchema.enum.company, () => ({
			id: field.ID,
			name: field.NAZEV,
			registrationNumber: field.ICO,
			taxNumber: nullableTextFn(field.DIC),
			folder: field.SLOZKA,
			vatPayer: logicalFn(field.PLATCE),
		}))
		.with(TypeEnumSchema.enum.supplier, () => ({
			companyId,
			id: integerFn(field.ID),
			name: field.NAZEV,
			registrationNumber: numericRegistrationNumberFn(field.ICO),
			taxNumber: nullableTextFn(field.DIC),
			street: field.ULICE,
			city: field.MESTO,
			postalCode: field.PSC,
			country: field.STAT,
			account: field.UCET,
			note: field.POZN,
		}))
		.with(TypeEnumSchema.enum.received_invoice, () => ({
			companyId,
			id: integerFn(field.ID),
			documentNumber: field.DOKLAD,
			supplierNumber: field.CISLODOD,
			variableSymbol: field.VS,
			supplierId: integerFn(field.PARTNER),
			issuedOn: dateFn(field.DATVYST),
			taxableOn: dateFn(field.DATZDAN),
			dueOn: dateFn(field.DATSPL),
			paidOn: dateFn(field.DATUHR),
			vat: {
				base0: field.ZAKL0,
				base12: field.ZAKL12,
				vat12: field.DPH12,
				base21: field.ZAKL21,
				vat21: field.DPH21,
			},
			total: field.CELKEM,
			currency: field.MENA,
			exchangeRate: nullableTextFn(field.KURZ),
			text: field.TEXT,
			note: field.POZN,
		}))
		.exhaustive();
	return {
		type,
		source: {
			origin: OriginEnumSchema.enum.kaktus,
			location,
			record: row.number,
		},
		data,
	};
};
