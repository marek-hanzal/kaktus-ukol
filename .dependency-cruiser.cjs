/** Stable import directions; semantic ownership remains in AGENTS.md and each exact owner. */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		{
			name: "source-imports-use-declared-domain-kinds",
			severity: "error",
			from: {},
			to: {
				path: "^src/",
				pathNot:
					"^src/(?:application-cli/taxy[.]ts|[^/]+/(?:fn|fx|schema|error|service|layer|command|flag)/[^/]+[.]ts)$",
			},
		},
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
					"^src/application-cli/taxy[.]ts$",
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
				pathNot: "^src/application-cli/taxy[.]ts$",
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
			name: "intermediate-contracts-stay-source-independent",
			severity: "error",
			from: {
				path: "^src/import-record/",
			},
			to: {
				path: "^src/(?:kaktus|taxy|example|dbf|accounting-record|record-import|record-export|record-comparison|ndjson|kaktus-write)/",
			},
		},
		{
			name: "accounting-domain-does-not-import-adapters",
			severity: "error",
			from: {
				path: "^src/accounting-record/",
			},
			to: {
				path: "^src/(?:kaktus|taxy|example|dbf|record-import|record-export|record-comparison|ndjson|kaktus-write)/",
			},
		},
		{
			name: "ndjson-does-not-import-accounting-domains",
			severity: "error",
			from: {
				path: "^src/ndjson/",
			},
			to: {
				path: "^src/(?:kaktus|taxy|example|record-import|record-export|accounting-record|import-record|kaktus-write)/",
			},
		},
		{
			name: "output-does-not-import-source-adapters",
			severity: "error",
			from: {
				path: "^src/record-export/",
			},
			to: {
				path: "^src/(?:kaktus|taxy|example|dbf|record-import|record-comparison|ndjson|kaktus-write)/",
			},
		},
		{
			name: "dbf-reader-does-not-import-business-or-operation-domains",
			severity: "error",
			from: {
				path: "^src/dbf/",
			},
			to: {
				path: "^src/",
				pathNot: "^src/(?:dbf|record-validation)/",
			},
		},
		{
			name: "comparison-does-not-import-source-adapters",
			severity: "error",
			from: {
				path: "^src/record-comparison/",
			},
			to: {
				path: "^src/(?:dbf|kaktus|taxy|example|kaktus-write)/",
			},
		},
		{
			name: "audit-does-not-import-business-or-source-domains",
			severity: "error",
			from: {
				path: "^src/audit-log/",
			},
			to: {
				path: "^src/(?:accounting-record|import-record|record-import|record-export|record-comparison|dbf|kaktus|taxy|example|ndjson|kaktus-write)/",
			},
		},
		{
			name: "file-boundaries-do-not-import-record-or-source-domains",
			severity: "error",
			from: {
				path: "^src/file-boundary/",
			},
			to: {
				path: "^src/(?:accounting-record|import-record|record-import|record-export|record-comparison|dbf|kaktus|taxy|example|ndjson|kaktus-write)/",
			},
		},
		{
			name: "append-and-text-primitives-stay-foundational",
			severity: "error",
			from: {
				path: "^src/(?:file-append|text-output)/",
			},
			to: {
				path: "^src/",
				pathNot: "^src/(?:file-append|text-output)/",
			},
		},
		{
			name: "target-writer-does-not-import-source-adapters",
			severity: "error",
			from: {
				path: "^src/kaktus-write/",
			},
			to: {
				path: "^src/(?:example|taxy)/",
			},
		},
		{
			name: "source-adapters-do-not-import-write-orchestration",
			severity: "error",
			from: {
				path: "^src/(?:kaktus|example|record-import|record-comparison)/",
			},
			to: {
				path: "^src/kaktus-write/",
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
