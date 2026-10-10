import { Argument, Command, Flag } from "effect/cli";
import { Console, Effect, Stream } from "effect";
import { z } from "zod";
import { ImportInvoiceSchema } from "~/taxy/schema/ImportInvoiceSchema";
import { InvoiceRequestAdmissionSchema } from "~/accounting-record/schema/InvoiceRequestAdmissionSchema";
import { ImportOfficeSchema } from "~/taxy/schema/ImportOfficeSchema";
import { ImportClientSchema } from "~/taxy/schema/ImportClientSchema";
import { OfficeSchema } from "~/accounting-record/schema/OfficeSchema";
import { ClientSchema } from "~/accounting-record/schema/ClientSchema";
import { CompanySchema } from "~/accounting-record/schema/CompanySchema";
import { SupplierSchema } from "~/accounting-record/schema/SupplierSchema";
import { InvoiceAdmissionSchema as AccountingInvoiceAdmissionSchema } from "~/accounting-record/schema/InvoiceAdmissionSchema";
import { RecordAdmissionSchema } from "~/accounting-record/schema/RecordAdmissionSchema";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { ProblemSchema } from "~/record-validation/schema/ProblemSchema";
import { ImportSummarySchema } from "~/record-import/schema/ImportSummarySchema";
import { IntermediateOutputSchema } from "~/record-export/schema/IntermediateOutputSchema";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";

import { DifferenceSchema } from "~/record-comparison/schema/DifferenceSchema";
import { EntrySchema as AuditEntrySchema } from "~/audit-log/schema/EntrySchema";
import { OutcomeSchema } from "~/kaktus-write/schema/OutcomeSchema";
import { WriteSummarySchema } from "~/kaktus-write/schema/WriteSummarySchema";
import { KaktusMetaSchema } from "~/import-record/schema/KaktusMetaSchema";

const runSchemaCommandFx = Effect.fn("runSchemaCommandFx")(function* ({
	schema,
	output,
}: {
	readonly schema: z.ZodType;
	readonly output: string;
}) {
	const document = JSON.stringify(
		z.toJSONSchema(schema, {
			reused: "ref",
			io: "input",
		}),
		null,
		2,
	);
	const receipt = yield* publishFileFx({
		options: {
			output,
			maxChunkBytes: 64 * 1024,
		},
		content: Stream.make(`${document}\n`).pipe(Stream.encodeText),
	});
	yield* Console.log(receipt.path);
});

/** Schema export is usable immediately; read/write integration commands are added with their real implementation. */
export const SchemaCommand = Command.make(
	"schema",
	{
		schema: Argument.ChoiceWithValue("contract", [
			[
				"write-outcome",
				OutcomeSchema,
			],
			[
				"write-summary",
				WriteSummarySchema,
			],
			[
				"kaktus-meta",
				KaktusMetaSchema,
			],
			[
				"record-difference",
				DifferenceSchema,
			],
			[
				"audit-entry",
				AuditEntrySchema,
			],
			[
				"taxy-import-invoice",
				ImportInvoiceSchema,
			],
			[
				"taxy-invoice",
				InvoiceRequestAdmissionSchema,
			],
			[
				"taxy-import-office",
				ImportOfficeSchema,
			],
			[
				"taxy-import-client",
				ImportClientSchema,
			],
			[
				"taxy-office",
				OfficeSchema,
			],
			[
				"taxy-client",
				ClientSchema,
			],
			[
				"accounting-company",
				CompanySchema,
			],
			[
				"accounting-supplier",
				SupplierSchema,
			],
			[
				"accounting-invoice",
				AccountingInvoiceAdmissionSchema,
			],
			[
				"intermediate-record",
				IntermediateRecordSchema,
			],
			[
				"accounting-record",
				RecordAdmissionSchema,
			],
			[
				"intermediate-output",
				IntermediateOutputSchema,
			],
			[
				"validation-problem",
				ProblemSchema,
			],
			[
				"import-summary",
				ImportSummarySchema,
			],
		]),
		output: Flag.String("output").pipe(
			Flag.withDefault(".out/schema.json"),
			Flag.withDescription("Atomically replaced JSON Schema output file."),
		),
	},
	runSchemaCommandFx,
).pipe(
	Command.withDescription(
		"Export the JSON input view of one named input, domain-admission or output contract.",
	),
);
