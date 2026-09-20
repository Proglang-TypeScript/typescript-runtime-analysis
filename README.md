# TypeScript runtime analysis

Independent reviewers: [structured questions, worksheets and adjudication procedure](docs/human-review-guide.md).

Latest census: [full repaired results and remaining validation boundaries](docs/census-repaired-followup.md).

Recovered Proglang-TypeScript runtime callbacks and declaration inference, a repaired declaration comparator, versioned JSON observations, multi-source evidence, passive relational synthesis and active polarity-directed sealing/refinement scaffolds. Original pattern analysis remains available as a reference workflow.

## Install and validate

Use Node **24 LTS** and npm. Node 26 is deliberately outside the supported runtime range. With nvm: `nvm install && nvm use`.

```sh
npm ci
npm run check
```

`check` builds the maintained TypeScript, runs preserved generator/comparator tests and recovery regression tests, exercises four real fixture workflows, and produces synthetic experiment results. No Kafka, browser or Docker is required for these first-party fixture checks. Lifecycle scripts are disabled in `.npmrc`.

On this host, where Node26 is installed, the optional clean-container helper works without installing Node24 or project dependencies on the host:

```sh
node scripts/check-in-docker.cjs
```

It streams source files into a limited unprivileged Node24 container without host mounts, installs from the lockfile, disconnects networking before checks, exports results into a new `work/` directory and removes its own container. Docker must be running and able to obtain the Node24 image.

TypeScript 6.0.3 provides the compiler API; native TypeScript 7.0.2 independently checks the generated client. The latest native compiler has no compiler API: see [Microsoft's transition guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/). Build explicitly uses the API compiler to avoid executable alias collisions.

## Commands

```sh
npm run cli -- trace experiments/fixtures/client.js --target-root experiments/fixtures --package tra-calculator-fixture --version 1.0.0 --out work/client.trace.json --trusted-fixture
npm run cli -- generate work/client.trace.json --module module --out work/module/index.d.ts --public-only
npm run cli -- compare work/module/index.d.ts work/module/index.d.ts
npm run cli -- patterns experiments/fixtures/module.js --trace work/client.trace.json
npm run experiment
node scripts/aggregate.cjs
npm run cli -- trace experiments/relational-signatures/inference.js --target-root experiments/relational-signatures --module module --package tra-relational-fixture --out work/inference.trace.json --trusted-fixture --invocations
npm run cli -- synthesize work/inference.trace.json.invocations.json --out work/relational.d.ts
npm run experiment:relational
npm run experiment:sealing
npm run census:prepare -- --out work/dt-smoke --smoke
npm run census -- --snapshot work/dt-smoke --out work/census-smoke
```

`--trusted-fixture` is an explicit assertion that code is a trusted first-party fixture. Never use it for downloaded packages. Each trace retains a validated envelope, a `.raw.json` backend artifact and `.execution.json` run metadata. Keep all three together; declaration generation consumes the raw sidecar. Unsupported evidence and conflicts are reported in the declaration's `.diagnostics.json` sidecar. Raw artifacts contain source-map metadata and may contain source paths; review before publication.

README extraction supports fenced `js`/`javascript` blocks and records their original line. The fixture workflow executes an actual extracted example. Package-test execution uses this fixture's own test entry point and distinguishes its internal test helper from the public module. General package-manager test-script orchestration is a research extension, not a claimed recovered feature.

## External packages

Prepare fixed-version package files and dependencies separately with install scripts disabled. Docker is mandatory for execution of external package code:

```sh
node scripts/run-isolated.cjs /path/to/package test-entry.js /path/to/run-output
```

Complete Mocha/Tape package suites use a separate networked dependency-preparation step followed by an offline, read-only execution step. Exact `ms@2.1.3` and `qs@6.15.3` profiles, commands, bounds and retained provenance are documented in [full-suite execution](docs/full-suite-execution.md). Add `--invocations` during execution when Line B tuples are required.

The runner uses Node 24, no network, a read-only root and source/tool mounts, one writable output mount, a 256 MB temporary filesystem, one CPU, 1 GB RAM, 128 processes, dropped capabilities and a 60-second timeout. It passes no host credentials or Docker socket into the container. Docker must be able to read the selected directories; this machine's Colima shares the home directory but macOS denies access to Documents, so use the adjacent repository under `/Users/thiemann/git/typescript`. This Colima configuration does not share `/tmp/colima`. Tests requiring network or additional services need a separately reviewed profile.

CommonJS is supported. The original Jalangi backend remains: TypeScript downlevels target source to ES5 and source maps recover original positions. Modern arrow syntax is covered by a regression test. This does not establish support for all JavaScript semantics, async behavior, ESM, classes, native bindings, dynamic imports or getters. Source files and dependencies are never rewritten during tracing; dependencies are executed but not instrumented.

## Experiments and documentation

Revised Track B retains one tuple per instrumented invocation, including arguments, receiver, result or thrown value, and synchronous callback links. `--invocations` writes an independently versioned `.invocations.json` sidecar; older component-wise traces cannot reconstruct tuples. The new workspace generates bounded identity/container-element generics, shallow discriminated overloads, correlated invocation unions, and two baselines, with supporting invocation IDs and explicit abstention diagnostics.

`npm run experiment:relational` uses only inference invocations to synthesize signatures, then checks independent inference and held-out typing clients (API6 and native7). Raw inference/held-out runs, declarations, baseline failures, metadata/hashes and script-generated tables are saved under `experiments/results/relational`. Regenerate these tables with `node -e "require('./scripts/relational-experiment.cjs').aggregate('experiments/results/relational')"`. Synthetic client passes are not proof of universal soundness or publication-quality evaluation. Callbacks/throws are preserved but their polymorphic inference, arbitrary conditional/mapped types and full receiver/async semantics remain outside this bounded scaffold.

`experiments/dataset.json` fixes synthetic package identities, versions, splits and seed. `experiments/results/` retains raw observations, declarations, metadata, predictions, exclusions, and generated CSV tables. Synthetic fixtures share conceptual code patterns and are **not** a leakage-free publication dataset.

- [Architecture](docs/architecture.md)
- [Provenance and import mapping](docs/provenance.md)
- [Recovery record](docs/recovery-report.md)
- [Dependency/security assessment](docs/security-remediation.md)
- [Current security/publication record](docs/security-publication-report.md)
- [Migration limits](docs/migration.md)
- [Research protocols and five-month plan](docs/research-directions.md)
- [Revised-description comparison and implementation mapping](docs/revision-delta.md)
- [Revision 2 delta and executed acceptance checks](docs/revision-2-delta.md)
- [Polarity-directed sealing contract and limitations](docs/sealing.md)
- [Census infrastructure, timed checkpoints and complete resume commands](readme-infrastructure.md)
- [Full pinned census: compact baseline evidence and remaining reviews](experiments/results/census-full-2026-09-14/README.md)
- [Census failure repairs, diagnostic review and isolated runtime pilots](docs/census-followup.md)
- [Phase-2 census setup, units, review and availability](docs/generic-api-census.md)
- [Sealing feasibility preparation and remaining gates](docs/sealing-feasibility-report.md)

Imported components retain their original licenses in `LICENSES/` and file notices. New recovery glue has no additional license grant pending the owner's choice. Upstream: [Proglang-TypeScript/typescript-runtime-analysis](https://github.com/Proglang-TypeScript/typescript-runtime-analysis), private because retained preservation material originates from a private repository.
