import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { Effect, Layer } from "effect";
import { Command } from "effect/cli";
import { version } from "../../package.json";
import { SchemaCommand } from "./command/SchemaCommand";
import { ImportIntermediateCommand } from "./command/ImportIntermediateCommand";
import { FileProcessingLogLayer } from "~/processing-log/layer/FileProcessingLogLayer";

const KaktusCommand = Command.make("kaktus").pipe(
	Command.withSubcommands([
		SchemaCommand,
		ImportIntermediateCommand,
	]),
	Command.withDescription("Local TAXY/Kaktus connector."),
);

// The only execution root. Domain code retains its exact service requirements.
Command.run(KaktusCommand, {
	version,
}).pipe(
	Effect.provide(FileProcessingLogLayer.pipe(Layer.provideMerge(NodeServices.layer))),
	NodeRuntime.runMain,
);
