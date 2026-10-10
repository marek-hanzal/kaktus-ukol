import iconv from "iconv-lite";
import { z } from "zod";

/** XML 1.0 text that survives both the import encoding and the target DBF encoding. */
export const KaktusTextSchema = z
	.string()
	.max(4096)
	.regex(/^[\t\n\r\u0020-\uD7FF\uE000-\uFFFD]*$/u, "Invalid XML 1.0 character")
	.refine((value) => value.trim() === value, "Kaktus trims surrounding whitespace")
	.refine(
		(value) =>
			[
				"windows-1250",
				"cp852",
			].every((encoding) => iconv.decode(iconv.encode(value, encoding), encoding) === value),
		"Text cannot be preserved in Windows-1250 and the target CP852 DBF",
	)
	.meta({
		id: "record-export.KaktusTextSchema",
		description:
			"Lossless Kaktus XML and DBF text; no replacement characters or implicit trimming.",
	});
export type KaktusTextSchema = typeof KaktusTextSchema;
export namespace KaktusTextSchema {
	export type Type = z.infer<KaktusTextSchema>;
}
