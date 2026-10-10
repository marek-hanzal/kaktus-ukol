import { Effect, FileSystem, Path, Stream } from "effect";
import { openDbfFx } from "~/dbf/fx/openDbfFx";
import type { ReaderOptionsSchema } from "~/dbf/schema/ReaderOptionsSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import type { CandidateSchema } from "~/record-import/schema/CandidateSchema";
import { SourcePathError } from "../error/SourcePathError";
import { TableMappingError } from "../error/TableMappingError";
import { toIntermediateFn } from "../fn/toIntermediateFn";
import { validateTableHeaderFx } from "../fx/validateTableHeaderFx";

/** Open one table at a time, check its protocol layout, then project independently framed rows. */
export const readTableStream = (
	root: string,
	options: ReaderOptionsSchema.Type,
	type: TypeEnumSchema.Type,
	companyId: string | null,
) =>
	Stream.unwrap(
		Effect.gen(function* () {
			const fileSystem = yield* FileSystem.FileSystem;
			const path = yield* Path.Path;
			const source = yield* fileSystem.realPath(options.path);
			const relative = path.relative(root, source);
			if (
				relative === ".." ||
				relative.startsWith(`..${path.sep}`) ||
				path.isAbsolute(relative)
			) {
				return yield* Effect.fail(
					new SourcePathError({
						root,
						path: source,
					}),
				);
			}
			const { header, rows } = yield* openDbfFx(options);
			yield* validateTableHeaderFx(header, type, options.path);
			if (type !== TypeEnumSchema.enum.company && companyId === null)
				return yield* Effect.fail(
					new TableMappingError({
						path: options.path,
						detail: `${type} records require company routing from FIRMY.DBF`,
					}),
				);
			return rows.pipe(
				Stream.filter((row) => !row.deleted),
				Stream.map(
					(row) =>
						({
							input: options.path,
							position: row.number,
							value: toIntermediateFn(row, type, options.path, companyId),
						}) satisfies CandidateSchema.Type,
				),
			);
		}),
	);
