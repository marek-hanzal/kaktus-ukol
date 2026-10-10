import { Effect, Path, Stream } from "effect";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import type { CandidateSchema } from "~/record-import/schema/CandidateSchema";
import { resolveCompanySourceFx } from "./resolveCompanySourceFx";
import { ensureCompanyUnlockedFx } from "./ensureCompanyUnlockedFx";
import type { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { createTableStreamFx } from "./createTableStreamFx";

/** Source routing admits only a safe folder and identity, without admitting the company's business data. */
export const createCompanyTablesStreamFx = Effect.fn("createCompanyTablesStreamFx")(function* (
	root: string,
	candidate: CandidateSchema.Type,
	options: ReadOptionsSchema.Type,
) {
	const path = yield* Path.Path;
	const source = yield* resolveCompanySourceFx(root, candidate);
	const checkUnlocked = ensureCompanyUnlockedFx(source);
	yield* checkUnlocked;
	const tableOptionsFn = (name: string) => ({
		path: path.join(source.directory, name),
		encoding: options.encoding,
		maxRecordBytes: options.maxRecordBytes,
	});
	return Stream.unwrap(
		createTableStreamFx(
			root,
			tableOptionsFn("ADRESAR.DBF"),
			TypeEnumSchema.enum.supplier,
			source.companyId,
		),
	).pipe(
		Stream.onEnd(checkUnlocked),
		Stream.concat(
			Stream.unwrap(
				createTableStreamFx(
					root,
					tableOptionsFn("FAKPRI.DBF"),
					TypeEnumSchema.enum.received_invoice,
					source.companyId,
				),
			),
		),
		Stream.onEnd(checkUnlocked),
	);
});
