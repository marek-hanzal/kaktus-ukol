import { z } from "zod";

/** Eight-digit Czech company identifier, preserving leading zeroes; no checksum admission. */
export const CompanyRegistrationNumberSchema = z
	.string()
	.regex(/^\d{8}$/)
	.meta({
		id: "accounting-value.CompanyRegistrationNumberSchema",
		description:
			"Eight-digit Czech company identifier, preserving leading zeroes; no checksum admission.",
	});
export type CompanyRegistrationNumberSchema = typeof CompanyRegistrationNumberSchema;
export namespace CompanyRegistrationNumberSchema {
	export type Type = z.infer<CompanyRegistrationNumberSchema>;
}
