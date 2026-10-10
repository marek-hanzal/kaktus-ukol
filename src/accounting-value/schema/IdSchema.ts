import { z } from "zod";

/** Non-empty exact identity; business ownership is checked separately. */
export const IdSchema = z.string().min(1).meta({
	id: "accounting-value.IdSchema",
	description: "Non-empty exact identity; business ownership is checked separately.",
});
export type IdSchema = typeof IdSchema;
export namespace IdSchema {
	export type Type = z.infer<IdSchema>;
}
