import type { z } from "zod";
import { InvoiceRecordSchema } from "./InvoiceRecordSchema";
import { InvoiceAdmissionSchema } from "./InvoiceAdmissionSchema";

/** Invoice envelope admission with field-level decimal diagnostics and preserved provenance. */
export const InvoiceRecordAdmissionSchema = InvoiceRecordSchema.extend({
	data: InvoiceAdmissionSchema,
}).meta({
	id: "accounting-record.InvoiceRecordAdmissionSchema",
	description:
		"Invoice envelope admission with field-level decimal diagnostics and preserved provenance.",
});
export type InvoiceRecordAdmissionSchema = typeof InvoiceRecordAdmissionSchema;
export namespace InvoiceRecordAdmissionSchema {
	export type Type = z.infer<InvoiceRecordAdmissionSchema>;
	export type Input = z.input<InvoiceRecordAdmissionSchema>;
}
