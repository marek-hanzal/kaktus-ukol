import { z } from "zod";
import { CompanyRecordSchema } from "./CompanyRecordSchema";
import { SupplierRecordSchema } from "./SupplierRecordSchema";
import { InvoiceRecordAdmissionSchema } from "./InvoiceRecordAdmissionSchema";

/** Strict JSON admission contract whose output is a complete internal accounting record. */
export const RecordAdmissionSchema = z
	.discriminatedUnion("type", [
		CompanyRecordSchema,
		SupplierRecordSchema,
		InvoiceRecordAdmissionSchema,
	])
	.meta({
		id: "accounting-record.RecordAdmissionSchema",
		description:
			"Strict JSON admission contract whose output is a complete internal accounting record.",
	});
export type RecordAdmissionSchema = typeof RecordAdmissionSchema;
export namespace RecordAdmissionSchema {
	export type Type = z.infer<RecordAdmissionSchema>;
	export type Input = z.input<RecordAdmissionSchema>;
}
