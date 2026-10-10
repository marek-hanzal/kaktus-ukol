import { Console, Effect, Option } from "effect";
import { Argument, Command, Flag } from "effect/cli";
import { exportKaktusFx } from "~/kaktus/fx/exportKaktusFx";
import type { ExportOptionsSchema } from "~/kaktus/schema/ExportOptionsSchema";

const runExportKaktusCommandFx = Effect.fn("runExportKaktusCommandFx")(function* (
	options: Omit<ExportOptionsSchema.Type, "invoiceId"> & {
		readonly invoiceId: Option.Option<number>;
	},
) {
	const receipt = yield* exportKaktusFx({
		...options,
		invoiceId: Option.getOrNull(options.invoiceId),
	});
	yield* Console.log(
		`Succeeded: ${receipt.records} invoices exported for company ${receipt.companyId}.\nXML: ${receipt.publication.path} (${receipt.publication.bytes} bytes; Windows-1250)\nProcessing log: ${receipt.log}\nAudit: ${receipt.audit.path}; operation ${receipt.audit.operationId}; completion ${receipt.audit.completion}`,
	);
});

export const ExportKaktusCommand = Command.make(
	"export",
	{
		input: Argument.String("intermediate-file"),
		companyId: Flag.String("company").pipe(
			Flag.withDescription("Exact four-digit target company ID."),
		),
		invoiceId: Flag.Int("invoice-id").pipe(
			Flag.optional,
			Flag.withDescription(
				"Select one company-scoped invoice ID; otherwise export all invoices of the company.",
			),
		),
		output: Flag.String("output").pipe(Flag.withDefault(".out/kaktus.xml")),
		actor: Flag.String("actor").pipe(
			Flag.withDescription("Caller-declared identity for the audit log."),
		),
		maxRecordBytes: Flag.Int("max-record-bytes").pipe(Flag.withDefault(64 * 1024)),
		maxOutputRecordBytes: Flag.Int("max-output-record-bytes").pipe(
			Flag.withDefault(64 * 1024),
			Flag.withDescription(
				"Maximum Windows-1250 bytes per XML invoice including provenance; at most 1 MiB.",
			),
		),
	},
	runExportKaktusCommandFx,
).pipe(
	Command.withDescription(
		"Export validated intermediate invoices as an atomic Kaktus 3.2 XML batch.",
	),
);
