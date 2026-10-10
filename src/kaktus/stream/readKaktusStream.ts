import { Effect, FileSystem, Path, Stream } from "effect";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import type { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { readCompanyTablesStream } from "./readCompanyTablesStream";
import { readTableStream } from "./readTableStream";

/** Walk FIRMY and each company's tables sequentially without collecting rows or company IDs. */
export const readKaktusStream = (options: ReadOptionsSchema.Type) =>
	Stream.unwrap(
		Effect.gen(function* () {
			const fileSystem = yield* FileSystem.FileSystem;
			const path = yield* Path.Path;
			const root = yield* fileSystem.realPath(options.input);
			const companies = readTableStream(
				root,
				{
					path: path.join(root, "FIRMY.DBF"),
					encoding: options.encoding,
					maxRecordBytes: options.maxRecordBytes,
				},
				TypeEnumSchema.enum.company,
				null,
			);
			return companies.pipe(
				Stream.flatMap(
					(candidate) =>
						Stream.make(candidate).pipe(
							Stream.concat(readCompanyTablesStream(root, candidate, options)),
						),
					{
						concurrency: 1,
					},
				),
			);
		}),
	);
