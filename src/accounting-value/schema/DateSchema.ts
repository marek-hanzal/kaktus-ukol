import { z } from "zod";

/** Calendar date without a timezone, in YYYY-MM-DD form. */
export const DateSchema = z.iso.date().meta({
	id: "accounting-value.DateSchema",
	description: "Calendar date without a timezone, in YYYY-MM-DD form.",
});
export type DateSchema = typeof DateSchema;
export namespace DateSchema {
	export type Type = z.infer<DateSchema>;
}
