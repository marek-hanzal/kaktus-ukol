import { Command } from "effect/cli";
import { ConvertKaktusCommand } from "./ConvertKaktusCommand";

export const KaktusCommand = Command.make("kaktus").pipe(
	Command.withDescription("Kaktus accounting system integration."),
	Command.withSubcommands([
		ConvertKaktusCommand,
	]),
);
