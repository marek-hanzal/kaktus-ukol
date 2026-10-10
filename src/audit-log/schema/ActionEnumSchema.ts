import { z } from "zod";
export const ActionEnumSchema = z.enum([
	"import_intermediate",
	"read_kaktus",
	"read_example",
	"compare_record",
	"export_kaktus",
]);
export type ActionEnumSchema = typeof ActionEnumSchema;
export namespace ActionEnumSchema {
	export type Type = z.infer<ActionEnumSchema>;
}
