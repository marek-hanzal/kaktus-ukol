import { escapeLineFn } from "~/text-output/fn/escapeLineFn";
import type { OutcomeSchema } from "../schema/OutcomeSchema";
/** One canonical outcome, printed as retrievable human text. */
export const formatOutcomeFn = (outcome: OutcomeSchema.Type): string =>
	`${outcome.status.toUpperCase()} request=${escapeLineFn(outcome.requestId ?? "<invalid-id>")} company=${outcome.companyId ?? "<unresolved>"} source=${escapeLineFn(outcome.source.location)}#${outcome.source.record} code=${escapeLineFn(outcome.code)} document=${escapeLineFn(outcome.documentNumber ?? "-")}: ${escapeLineFn(outcome.detail)}\n`;
