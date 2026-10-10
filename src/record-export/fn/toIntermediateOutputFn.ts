import { match } from "ts-pattern";
import type { RecordSchema } from "~/accounting-record/schema/RecordSchema";
import { formatDecimalFn } from "~/accounting-value/fn/formatDecimalFn";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import type { IntermediateOutputSchema } from "../schema/IntermediateOutputSchema";

/** Project admitted data onto the public contract; internal additions never leak through object spreads. */
export const toIntermediateOutputFn = (
	record: RecordSchema.Type,
): IntermediateOutputSchema.Type => {
	const source = {
		origin: record.source.origin,
		location: record.source.location,
		record: record.source.record,
	};
	return match(record)
		.returnType<IntermediateOutputSchema.Type>()
		.with(
			{
				type: TypeEnumSchema.enum.company,
			},
			({ data }) => ({
				type: TypeEnumSchema.enum.company,
				source,
				data: {
					id: data.id,
					name: data.name,
					registrationNumber: data.registrationNumber,
					taxNumber: data.taxNumber,
					folder: data.folder,
					vatPayer: data.vatPayer,
				},
			}),
		)
		.with(
			{
				type: TypeEnumSchema.enum.supplier,
			},
			({ data }) => ({
				type: TypeEnumSchema.enum.supplier,
				source,
				data: {
					companyId: data.companyId,
					id: data.id,
					name: data.name,
					registrationNumber: data.registrationNumber,
					taxNumber: data.taxNumber,
					street: data.street,
					city: data.city,
					postalCode: data.postalCode,
					country: data.country,
					account: data.account,
					note: data.note,
				},
			}),
		)
		.with(
			{
				type: TypeEnumSchema.enum.received_invoice,
			},
			({ data }) => ({
				type: TypeEnumSchema.enum.received_invoice,
				source,
				data: {
					companyId: data.companyId,
					id: data.id,
					documentNumber: data.documentNumber,
					supplierNumber: data.supplierNumber,
					variableSymbol: data.variableSymbol,
					supplierId: data.supplierId,
					issuedOn: data.issuedOn,
					taxableOn: data.taxableOn,
					dueOn: data.dueOn,
					paidOn: data.paidOn,
					vat: {
						base0: formatDecimalFn(data.vat.base0),
						base12: formatDecimalFn(data.vat.base12),
						vat12: formatDecimalFn(data.vat.vat12),
						base21: formatDecimalFn(data.vat.base21),
						vat21: formatDecimalFn(data.vat.vat21),
					},
					total: formatDecimalFn(data.total),
					currency: data.currency,
					exchangeRate:
						data.exchangeRate === null ? null : formatDecimalFn(data.exchangeRate),
					text: data.text,
					note: data.note,
				},
			}),
		)
		.exhaustive();
};
