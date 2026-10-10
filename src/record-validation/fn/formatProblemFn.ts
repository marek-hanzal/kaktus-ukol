import type { ProblemSchema } from "../schema/ProblemSchema";
/** Canonical field diagnostic rendered as a sentence, then escaped by the log printer. */
export const formatProblemFn = (problem: ProblemSchema.Type): string => {
	const field = problem.issue.path.length === 0 ? "<record>" : problem.issue.path.join(".");
	const provenance =
		problem.source === null
			? ""
			: `; source ${problem.source.location}:${problem.source.record}`;
	return `${problem.input}:${problem.position}; ${problem.stage}; ${problem.type ?? "unknown type"}${provenance}; field ${field}; ${problem.issue.code}: ${problem.issue.message}`;
};
