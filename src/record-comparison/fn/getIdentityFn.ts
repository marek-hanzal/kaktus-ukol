import { match } from "ts-pattern";
import type { IntermediateOutputSchema } from "~/record-export/schema/IntermediateOutputSchema";
import type { IdentitySchema } from "../schema/IdentitySchema";
export const getIdentityFn = (record: IntermediateOutputSchema.Type): IdentitySchema.Type =>
	match(record)
		.with(
			{
				type: "company",
			},
			({ type, data }) => ({
				type,
				companyId: null,
				id: data.id,
			}),
		)
		.with(
			{
				type: "supplier",
			},
			{
				type: "received_invoice",
			},
			({ type, data }) => ({
				type,
				companyId: data.companyId,
				id: data.id,
			}),
		)
		.exhaustive();
