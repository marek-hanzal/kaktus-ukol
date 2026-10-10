import { Effect, Path } from "effect";
import { runAuditedFx } from "~/audit-log/fx/runAuditedFx";
import { ActionEnumSchema } from "~/audit-log/schema/ActionEnumSchema";
import { checkDataPathsFx } from "~/file-boundary/fx/checkDataPathsFx";
import { importRecordsFx } from "~/record-import/fx/importRecordsFx";
import { FormatEnumSchema } from "~/record-export/schema/FormatEnumSchema";
import { parseRecordFx } from "~/record-validation/fx/parseRecordFx";
import { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { readKaktusStream } from "../stream/readKaktusStream";

/** Read-only conversion reuses the shared admission, diagnostics, audit and atomic publication. */
export const readKaktusFx = Effect.fn("readKaktusFx")(function* (input: ReadOptionsSchema.Type) {
	const options = yield* parseRecordFx(ReadOptionsSchema, input, "Kaktus read options");
	const path = yield* Path.Path;
	const root = path.resolve(options.input);
	const output = path.resolve(options.output);
	yield* checkDataPathsFx(
		[
			root,
		],
		output,
		true,
	);
	const audited = yield* runAuditedFx(
		{
			actor: options.actor,
			action: ActionEnumSchema.enum.read_kaktus,
			inputs: [
				root,
			],
			output,
		},
		importRecordsFx({
			records: readKaktusStream({
				...options,
				input: root,
				output,
			}),
			publication: {
				output,
				maxChunkBytes: options.maxOutputRecordBytes + 1,
			},
			exportOptions: {
				format: FormatEnumSchema.enum.intermediate,
				maxRecordBytes: options.maxOutputRecordBytes,
			},
		}),
	);
	return {
		...audited.result,
		audit: audited.audit,
	};
});
