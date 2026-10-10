import { builtinModules } from "node:module";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { name, version, engines } from "../package.json";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
	absWorkingDir: root,
	entryPoints: [
		"src/application-cli/taxy.ts",
	],
	outfile: "dist/taxy-cli.mjs",
	bundle: true,
	platform: "node",
	format: "esm",
	target: "node24",
	metafile: true,
	banner: {
		js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
	},
});

// A distributed bundle may depend on Node built-ins, never on an installed node_modules tree.
const builtins = new Set(
	builtinModules.flatMap((name) => [
		name,
		`node:${name}`,
	]),
);
for (const output of Object.values(result.metafile.outputs)) {
	for (const dependency of output.imports) {
		if (dependency.external && !builtins.has(dependency.path)) {
			throw new Error(`Bundle retains an external dependency: ${dependency.path}`);
		}
	}
}

// Install only the prebuilt application; development dependencies stay in the source project.
await writeFile(
	join(root, "dist", "package.json"),
	`${JSON.stringify(
		{
			name,
			version,
			private: true,
			type: "module",
			bin: {
				"taxy-cli": "taxy-cli.mjs",
			},
			engines,
			files: [
				"taxy-cli.mjs",
			],
		},
		null,
		2,
	)}\n`,
);
