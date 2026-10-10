import { z } from "zod";
import { ActorSchema } from "./ActorSchema";
import { ActionEnumSchema } from "./ActionEnumSchema";
export const OperationSchema = z
	.object({
		actor: ActorSchema,
		bestEffort: z.boolean().optional(),
		action: ActionEnumSchema,
		inputs: z.array(z.string().min(1).max(4096)).min(1).max(3),
		output: z.string().min(1).max(4096),
	})
	.strict()
	.meta({
		id: "audit-log.OperationSchema",
	});
export type OperationSchema = typeof OperationSchema;
export namespace OperationSchema {
	export type Type = z.infer<OperationSchema>;
}
