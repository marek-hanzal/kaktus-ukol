import { Command } from "effect/cli";
import { ConvertKaktusCommand } from "./ConvertKaktusCommand";
import { ExportKaktusCommand } from "./ExportKaktusCommand";
import { ImportKaktusCommand } from "./ImportKaktusCommand";

export const KaktusCommand = Command.make("kaktus").pipe(
	Command.withDescription("Kaktus accounting system integration."),
	Command.withSubcommands([
		ConvertKaktusCommand,
		ExportKaktusCommand,
		ImportKaktusCommand,
	]),
);
