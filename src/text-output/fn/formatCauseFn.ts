import type { Cause } from "effect";
import { match } from "ts-pattern";

const formatErrorFn = (error: unknown): string =>
	error instanceof Error ? error.message : String(error);
/** Compact diagnostics retain the distinction between expected failure, defect and interruption. */
export const formatCauseFn = <E>(cause: Cause.Cause<E>): string =>
	cause.reasons
		.map((reason) =>
			match(reason)
				.with(
					{
						_tag: "Fail",
					},
					({ error }) => `Failure: ${formatErrorFn(error)}`,
				)
				.with(
					{
						_tag: "Die",
					},
					({ defect }) => `Defect: ${formatErrorFn(defect)}`,
				)
				.with(
					{
						_tag: "Interrupt",
					},
					({ fiberId }) => `Interrupted: fiber ${fiberId}`,
				)
				.exhaustive(),
		)
		.join("; ");
