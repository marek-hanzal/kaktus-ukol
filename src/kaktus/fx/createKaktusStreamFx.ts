import { Effect, FileSystem, Path, Stream } from "effect";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import type { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { createCompanyTablesStreamFx } from "./createCompanyTablesStreamFx";
import { createTableStreamFx } from "./createTableStreamFx";
import { checkCompanyLocksFx } from "./checkCompanyLocksFx";

/** Walk FIRMY and each company's tables sequentially without collecting rows or company IDs. */
export const createKaktusStreamFx = Effect.fn("createKaktusStreamFx")(function* (
	options: ReadOptionsSchema.Type,
) {
	const fileSystem = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const root = yield* fileSystem.realPath(options.input);
	const companies = Stream.unwrap(
		createTableStreamFx(
			root,
			{
				path: path.join(root, "FIRMY.DBF"),
				encoding: options.encoding,
				maxRecordBytes: options.maxRecordBytes,
			},
			TypeEnumSchema.enum.company,
			null,
		),
	);
	return companies.pipe(
		Stream.flatMap(
			(candidate) =>
				Stream.make(candidate).pipe(
					Stream.concat(
						Stream.unwrap(createCompanyTablesStreamFx(root, candidate, options)),
					),
				),
			{
				concurrency: 1,
			},
		),
		Stream.onEnd(checkCompanyLocksFx(root, options)),
	);
});
