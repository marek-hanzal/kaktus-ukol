#!/usr/bin/env node
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { Effect, Layer } from "effect";
import { Command } from "effect/cli";
import { version } from "../../package.json";
import { SchemaCommand } from "./command/SchemaCommand";
import { ImportIntermediateCommand } from "./command/ImportIntermediateCommand";
import { FileProcessingLogLayer } from "~/processing-log/layer/FileProcessingLogLayer";

import { CompareRecordCommand } from "./command/CompareRecordCommand";
import { FileAuditLogLayer } from "~/audit-log/layer/FileAuditLogLayer";
import { KaktusCommand } from "./command/KaktusCommand";
import { ExampleCommand } from "./command/ExampleCommand";

const TaxyCommand = Command.make("taxy-cli").pipe(
	Command.withSubcommands([
		SchemaCommand,
		ImportIntermediateCommand,
		CompareRecordCommand,
		KaktusCommand,
		ExampleCommand,
	]),
	Command.withDescription("Local TAXY/Kaktus connector."),
);

// The only execution root. Domain code retains its exact service requirements.
Command.run(TaxyCommand, {
	version,
}).pipe(
	Effect.provide(
		Layer.mergeAll(FileProcessingLogLayer, FileAuditLogLayer).pipe(
			Layer.provideMerge(NodeServices.layer),
		),
	),
	NodeRuntime.runMain,
);
