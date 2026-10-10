/** Stable import directions; semantic ownership remains in AGENTS.md and each exact owner. */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		{
			name: "no-circular",
			severity: "error",
			from: {},
			to: {
				circular: true,
			},
		},
		{
			name: "no-unresolvable",
			severity: "error",
			from: {},
			to: {
				couldNotResolve: true,
			},
		},
		{
			name: "declared-package-dependencies",
			severity: "error",
			from: {},
			to: {
				dependencyTypes: [
					"npm-no-pkg",
					"npm-unknown",
				],
			},
		},
		{
			name: "no-orphans",
			severity: "error",
			from: {
				orphan: true,
				pathNot: [
					"^src/application-cli/kaktus[.]ts$",
					"^tooling/build[.]ts$",
					"[.]d[.]ts$",
				],
			},
			to: {},
		},
		{
			name: "production-does-not-import-dev-packages",
			severity: "error",
			from: {
				path: "^src/",
			},
			to: {
				dependencyTypes: [
					"npm-dev",
				],
				dependencyTypesNot: [
					"type-only",
				],
				pathNot: "node_modules/@types/",
			},
		},
		{
			name: "production-does-not-import-tests-or-tooling",
			severity: "error",
			from: {
				path: "^src/",
			},
			to: {
				path: "^(?:test|tooling)/",
			},
		},
		{
			name: "cli-is-terminal",
			severity: "error",
			from: {
				path: "^src/",
				pathNot: "^src/application-cli/",
			},
			to: {
				path: "^src/application-cli/",
			},
		},
		{
			name: "node-host-is-selected-only-at-entrypoint",
			severity: "error",
			from: {
				path: "^src/",
				pathNot: "^src/application-cli/kaktus[.]ts$",
			},
			to: {
				path: "^node_modules/@effect/platform-node/",
			},
		},
		{
			name: "accounting-values-stay-foundational",
			severity: "error",
			from: {
				path: "^src/accounting-value/",
			},
			to: {
				path: "^src/",
				pathNot: "^src/accounting-value/",
			},
		},
		{
			name: "schemas-do-not-import-behavior",
			severity: "error",
			from: {
				path: "^src/[^/]+/schema/",
			},
			to: {
				path: "^src/",
				pathNot: "^src/[^/]+/schema/",
			},
		},
		{
			name: "errors-do-not-import-execution",
			severity: "error",
			from: {
				path: "^src/[^/]+/error/",
			},
			to: {
				path: "^src/[^/]+/(?:fx|layer|service|command)/",
			},
		},
		{
			name: "capabilities-do-not-import-implementations",
			severity: "error",
			from: {
				path: "^src/[^/]+/service/",
			},
			to: {
				path: "^src/[^/]+/(?:fx|layer|command)/",
				dependencyTypesNot: [
					"type-only",
				],
			},
		},
		{
			name: "fn-does-not-import-effects-or-live-capabilities",
			severity: "error",
			from: {
				path: "^src/[^/]+/fn/",
			},
			to: {
				path: "^src/[^/]+/(?:fx|layer|service|command)/",
				dependencyTypesNot: [
					"type-only",
				],
			},
		},
		{
			name: "fn-does-not-import-node-io",
			severity: "error",
			from: {
				path: "^src/[^/]+/fn/",
			},
			to: {
				dependencyTypes: [
					"core",
				],
				dependencyTypesNot: [
					"type-only",
				],
			},
		},
	],
	options: {
		doNotFollow: {
			path: "node_modules",
		},
		tsPreCompilationDeps: true,
		tsConfig: {
			fileName: "tsconfig.json",
		},
		detectProcessBuiltinModuleCalls: true,
		enhancedResolveOptions: {
			exportsFields: [
				"exports",
			],
			conditionNames: [
				"import",
				"node",
				"default",
				"types",
			],
			mainFields: [
				"module",
				"main",
				"types",
				"typings",
			],
		},
	},
};
