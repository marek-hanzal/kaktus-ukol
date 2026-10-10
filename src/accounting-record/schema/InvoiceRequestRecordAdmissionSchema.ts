import type { z } from "zod";
import { InvoiceRequestRecordSchema } from "./InvoiceRequestRecordSchema";
import { InvoiceRequestAdmissionSchema } from "./InvoiceRequestAdmissionSchema";

/** Exact decimal admission for an invoice request, without target-side IDs. */
export const InvoiceRequestRecordAdmissionSchema = InvoiceRequestRecordSchema.extend({
	data: InvoiceRequestAdmissionSchema,
}).meta({
	id: "accounting-record.InvoiceRequestRecordAdmissionSchema",
	description: "Exact decimal admission for an invoice request, without target-side IDs.",
});
export type InvoiceRequestRecordAdmissionSchema = typeof InvoiceRequestRecordAdmissionSchema;
export namespace InvoiceRequestRecordAdmissionSchema {
	export type Type = z.infer<InvoiceRequestRecordAdmissionSchema>;
	export type Input = z.input<InvoiceRequestRecordAdmissionSchema>;
}
