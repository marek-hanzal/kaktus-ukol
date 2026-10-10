import { Command } from "effect/cli";
import { ConvertExampleCommand } from "./ConvertExampleCommand";

export const ExampleCommand = Command.make("example").pipe(
	Command.withDescription("Supplied TAXY example JSON integration."),
	Command.withSubcommands([
		ConvertExampleCommand,
	]),
);
