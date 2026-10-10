import { Effect, Path, Stream } from "effect";
import { TypeEnumSchema } from "~/import-record/schema/TypeEnumSchema";
import type { ReadOptionsSchema } from "../schema/ReadOptionsSchema";
import { createTableStreamFx } from "./createTableStreamFx";
import { ensureCompanyUnlockedFx } from "./ensureCompanyUnlockedFx";
import { resolveCompanySourceFx } from "./resolveCompanySourceFx";

/** Rescan routing instead of retaining an unbounded company list until publication. */
export const checkCompanyLocksFx = Effect.fn("checkCompanyLocksFx")(function* (
	root: string,
	options: ReadOptionsSchema.Type,
) {
	const path = yield* Path.Path;
	yield* Stream.unwrap(
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
	).pipe(
		Stream.runForEach((candidate) =>
			resolveCompanySourceFx(root, candidate).pipe(Effect.flatMap(ensureCompanyUnlockedFx)),
		),
	);
});
