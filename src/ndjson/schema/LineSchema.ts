import { z } from "zod";

/** One bounded physical input line, without its CRLF or LF terminator. */
export const LineSchema = z
	.object({
		number: z.int().positive(),
		text: z.string(),
	})
	.strict()
	.meta({
		id: "ndjson.LineSchema",
		description: "One bounded physical input line, without its CRLF or LF terminator.",
	});
export type LineSchema = typeof LineSchema;
export namespace LineSchema {
	export type Type = z.infer<LineSchema>;
}
