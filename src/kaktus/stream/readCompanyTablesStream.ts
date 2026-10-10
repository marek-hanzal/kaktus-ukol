import { Effect, Path, Stream } from "effect";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import type { CandidateSchema } from "~/record-import/schema/CandidateSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { CompanyLocationSchema } from "../schema/CompanyLocationSchema";
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
			const tableOptions = (name: string) => ({
				path: path.join(root, location.folder, name),
				encoding: options.encoding,
				maxRecordBytes: options.maxRecordBytes,
			});
			return readTableStream(
				root,
				tableOptions("ADRESAR.DBF"),
				TypeEnumSchema.enum.supplier,
				location.companyId,
			).pipe(
				Stream.concat(
					readTableStream(
						root,
						tableOptions("FAKPRI.DBF"),
						TypeEnumSchema.enum.received_invoice,
						location.companyId,
					),
				),
			);
		}),
	);
