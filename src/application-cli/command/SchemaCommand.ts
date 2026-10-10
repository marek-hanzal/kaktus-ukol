import { Argument, Command, Flag } from "effect/cli";
import { Console, Effect, Stream } from "effect";
import { z } from "zod";
import { ImportInvoiceSchema } from "~/taxy/schema/ImportInvoiceSchema";
import { InvoiceSchema as TaxyInvoiceSchema } from "~/taxy/schema/InvoiceSchema";
import { ImportOfficeSchema } from "~/taxy/schema/ImportOfficeSchema";
import { ImportClientSchema } from "~/taxy/schema/ImportClientSchema";
import { OfficeSchema } from "~/taxy/schema/OfficeSchema";
import { ClientSchema } from "~/taxy/schema/ClientSchema";
import { CompanySchema } from "~/accounting-record/schema/CompanySchema";
import { SupplierSchema } from "~/accounting-record/schema/SupplierSchema";
import { InvoiceSchema as AccountingInvoiceSchema } from "~/accounting-record/schema/InvoiceSchema";
import { RecordSchema } from "~/accounting-record/schema/RecordSchema";
import { IntermediateRecordSchema } from "~/import-record/schema/IntermediateRecordSchema";
import { ProblemSchema } from "~/record-validation/schema/ProblemSchema";
import { ImportSummarySchema } from "~/record-import/schema/ImportSummarySchema";
import { publishFileFx } from "~/file-publication/fx/publishFileFx";

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
				"taxy-import-invoice",
				ImportInvoiceSchema,
			],
			[
				"taxy-invoice",
				TaxyInvoiceSchema,
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
				AccountingInvoiceSchema,
			],
			[
				"intermediate-record",
				IntermediateRecordSchema,
			],
			[
				"accounting-record",
				RecordSchema,
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
).pipe(Command.withDescription("Export one named input or domain contract."));
