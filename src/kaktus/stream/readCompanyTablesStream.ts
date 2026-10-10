import { Effect, Path, Stream } from "effect";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import type { CandidateSchema } from "~/record-import/schema/CandidateSchema";
import { resolveCompanySourceFx } from "../fx/resolveCompanySourceFx";
import { ensureCompanyUnlockedFx } from "../fx/ensureCompanyUnlockedFx";
import type { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { readTableStream } from "./readTableStream";

/** Source routing admits only a safe folder and identity, without admitting the company's business data. */
export const readCompanyTablesStream = (
	root: string,
	candidate: CandidateSchema.Type,
	options: ReadOptionsSchema.Type,
) =>
	Stream.unwrap(
		Effect.gen(function* () {
			const path = yield* Path.Path;
			const source = yield* resolveCompanySourceFx(root, candidate);
			const checkUnlocked = ensureCompanyUnlockedFx(source);
			yield* checkUnlocked;
			const tableOptions = (name: string) => ({
				path: path.join(source.directory, name),
				encoding: options.encoding,
				maxRecordBytes: options.maxRecordBytes,
			});
			return readTableStream(
				root,
				tableOptions("ADRESAR.DBF"),
				TypeEnumSchema.enum.supplier,
				source.companyId,
			).pipe(
				Stream.onEnd(checkUnlocked),
				Stream.concat(
					readTableStream(
						root,
						tableOptions("FAKPRI.DBF"),
						TypeEnumSchema.enum.received_invoice,
						source.companyId,
					),
				),
				Stream.onEnd(checkUnlocked),
			);
		}),
	);
