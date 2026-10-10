import { Effect, FileSystem, Path } from "effect";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import type { CandidateSchema } from "~/record-import/schema/CandidateSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { SourcePathError } from "../error/SourcePathError";
import { CompanyLocationSchema } from "../schema/CompanyLocationSchema";
import type { CompanySourceSchema } from "../schema/CompanySourceSchema";

/** Admit safe source routing before checking locks or opening company tables. */
export const resolveCompanySourceFx = Effect.fn("resolveCompanySourceFx")(function* (
	root: string,
	candidate: CandidateSchema.Type,
) {
	const fileSystem = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const company = yield* parseRecordFx(
		IntermediateRecordSchema,
		candidate.value,
		candidate.input,
	);
	const location = yield* parseRecordFx(
		CompanyLocationSchema,
		{
			companyId: company.data.id,
			folder: company.data.folder,
		},
		`${candidate.input}#${candidate.position}`,
	);
	const directory = yield* fileSystem.realPath(path.join(root, location.folder));
	const relative = path.relative(root, directory);
	if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
		return yield* Effect.fail(
			new SourcePathError({
				root,
				path: directory,
			}),
		);
	}
	return {
		companyId: location.companyId,
		directory,
	} satisfies CompanySourceSchema.Type;
});
