import { Data } from "effect";
import type { CompanyIdSchema } from "../schema/CompanyIdSchema";

/** Kaktus owns this marker; the connector must never remove another user's lock. */
export class CompanyLockedError extends Data.TaggedError("CompanyLockedError")<{
	readonly companyId: CompanyIdSchema.Type;
	readonly path: string;
}> {
	override get message(): string {
		return `Kaktus company ${this.companyId} is locked (${this.path}). Close the company in Kaktus and retry.`;
	}
}
