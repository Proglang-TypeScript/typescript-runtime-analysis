# Codex Project Work Description: Recover and Consolidate Proglang-TypeScript

## Mission

Recover the checked-out Proglang-TypeScript projects, bring the relevant software to a reproducible runnable state on a current development environment, and consolidate the maintained functionality into a fresh repository that can serve as the foundation for one of two four-to-five-month research projects intended to produce a peer-reviewed publication:

1. combining runtime evidence from README examples and package tests to generate public TypeScript API declarations; or
2. proposing relational TypeScript signatures from invocation-level observations and actively validating or refining them using polarity-directed sealing.

The work is not a wholesale rewrite. Preserve working behavior, experimental artifacts, attribution, licenses, and history wherever practical. Prefer small verified migrations over broad speculative redesigns. Repository recovery is enabling work: prioritize decisions that leave enough time for a controlled experiment, artifact, and submission-ready paper.

## Starting assumptions

- The working directory contains checkouts of some repositories from [`Proglang-TypeScript`](https://github.com/Proglang-TypeScript).
- Some repositories may have uncommitted user changes. Treat all pre-existing changes as user-owned.
- The repositories were developed at different times and may use incompatible Node.js, npm, TypeScript, Babel, Jalangi/NodeProf, Docker, Python, or operating-system versions.
- Open dependency/security pull requests may exist. They are evidence to inspect, not authorization to merge blindly.
- Network, GitHub authentication, package registries, Docker, or specific runtimes may be unavailable. Record such blockers precisely and continue with work that does not require them.
- Do not publish, push, merge pull requests, create a remote repository, or change repository visibility unless explicitly authorized.

## Candidate source repositories

Inventory all checkouts present before deciding scope. Likely relevant repositories include:

- `run-time-information-gathering`
- `ts-declaration-file-generator`
- `ts-declaration-file-generator-service`
- `dts-generate-method`
- `ts-ast-utils`
- `ts-visitors`
- `dts-auto-generate`
- `dts-runtime-eric-peairs-test-files`
- `js-code-pattern-discovery`
- `tsd-generation-report`

Additional thesis repositories may be checked out under personal forks or other names, including the test-driven pipeline and the static/dynamic pattern-distribution implementation. Discover them from remotes, READMEs, submodules, package metadata, thesis references, and sibling directories. Do not assume a similarly named repository has the intended content.

## Required operating principles

1. **Inspect before changing.** Read repository instructions, `AGENTS.md`, licenses, remotes, branches, tags, package manifests, lockfiles, CI definitions, Dockerfiles, and build scripts.
2. **Protect user work.** Before fetching or changing a checkout, record `git status --short`, current branch, current commit, remotes, and divergence. Do not reset, discard, stash, or overwrite user changes without explicit approval.
3. **Separate recovery from modernization.** First reproduce the latest known behavior with the least invasive compatible environment. Then modernize incrementally.
4. **Do not merge security PRs mechanically.** Inspect each PR/diff/advisory, determine whether it applies to production or development dependencies, update in a controlled branch, and run relevant tests. Major-version upgrades require migration review.
5. **Do not hide failures.** Never disable meaningful tests, weaken assertions, suppress type errors, or remove functionality merely to obtain a green build. Quarantine an obsolete optional component only with a written rationale.
6. **Preserve provenance and licenses.** The consolidated repository must state the source repository, source commit, authorship, and license of every imported component.
7. **Keep experiments reproducible and safe.** Do not execute arbitrary third-party package tests directly on the host. Use a resource-limited container without host credentials, privileged mode, or writable access outside explicit work/output directories.
8. **No secrets in logs or commits.** Inspect configurations for tokens and credentials; use environment-variable templates and redacted diagnostics.
9. **Prefer current LTS tooling.** If a component cannot yet run on the selected current Node.js LTS, document and temporarily pin the oldest supported runtime needed to reproduce it. Do not silently claim modernization is complete.
10. **Make commits logically.** If commits are authorized in the local repositories, keep recovery, dependency updates, behavior changes, and consolidation separate. Do not push without authorization.

## Phase 0: workspace and repository inventory

Create `recovery-report.md` at the workspace root and maintain it throughout the task.

For every checkout, record:

- directory and repository name;
- remote URLs;
- current branch, HEAD, tags, and date of last substantive commit;
- clean/dirty status and a summary of local changes;
- ahead/behind/diverged state relative to the appropriate upstream branch;
- language and package-manager versions;
- license;
- stated purpose and likely role in the overall pipeline;
- references to other repositories;
- availability of tests, CI, examples, Docker support, releases, and packages;
- open pull requests, especially dependency/security PRs;
- obvious duplication or supersession relationships.

Identify the actual pipeline boundaries and file formats. At minimum determine:

- how JavaScript is selected, transpiled, and instrumented;
- how runtime information is represented;
- how the trace generator invokes or communicates with the declaration generator;
- how `.d.ts` files are parsed and compared;
- how README examples and package tests are obtained and executed;
- how pattern IDs and type distributions are represented;
- which components are prototypes, experiments, libraries, orchestration wrappers, or reports.

Do not edit source code during this phase except to add the workspace-level report if the workspace is not itself one of the source repositories.

## Phase 1: synchronize source checkouts safely

For each clean checkout:

1. fetch all remotes and tags without pruning destructively;
2. determine the canonical upstream/default branch;
3. compare local HEAD with upstream and relevant open PR branches;
4. fast-forward only when it is unambiguous and preserves the local branch;
5. otherwise report the divergence and stop that repository's synchronization until a merge/rebase policy is approved.

For each dirty checkout:

- do not pull, switch branches, or rewrite history;
- inspect whether incoming changes overlap local changes;
- report the safe options and continue with other repositories;
- use a separate temporary clone or worktree for upstream inspection if needed.

Record original and resulting commits in `recovery-report.md`.

## Phase 2: establish reproducible baselines

For each relevant repository:

1. read its documented setup and CI configuration;
2. determine the historically expected Node.js/npm/Python/Java/Docker environment from lockfiles, release dates, and CI;
3. install dependencies from lockfiles using reproducible commands (`npm ci` where appropriate);
4. run formatting checks, type checking, unit tests, integration tests, and documented examples separately;
5. record exact commands, versions, exit status, duration, and concise failure classification;
6. distinguish environmental failures, dependency-resolution failures, compile errors, test failures, and behavioral defects;
7. capture representative expected inputs and outputs as regression fixtures.

Do not begin dependency upgrades until the historical or minimally compatible baseline has been attempted and documented.

## Phase 3: dependency, security, and bitrot remediation

Inspect GitHub security/dependency pull requests and local audit results. Produce a dependency-upgrade table containing:

- repository and package;
- current and proposed versions;
- direct or transitive status;
- runtime, development, build, or test role;
- advisory/CVE or PR reference;
- breaking-change risk;
- chosen action and validation performed.

Apply upgrades in small groups:

1. safe patch/minor updates with no API migration;
2. build/test-only dependencies;
3. TypeScript and type-definition updates;
4. Babel/parser/instrumentation updates;
5. major runtime or framework updates.

After each group, run the narrowest relevant tests followed by the repository's complete test suite. Update code only where necessary for supported APIs. Add regression tests for every behavior-affecting fix.

Pay particular attention to:

- obsolete TypeScript compiler-API calls;
- Node.js module-system differences (CommonJS versus ESM);
- removed Node.js APIs;
- stale Babel presets/plugins;
- Jalangi2 and NodeProf compatibility with modern syntax;
- native or abandoned dependencies;
- lockfile format changes;
- deprecated GitHub Actions;
- Docker base images and non-root execution;
- unsafe shell quoting and unvalidated paths;
- synchronous or unbounded trace writes;
- network services such as Kafka that may be optional rather than essential.

If Jalangi2 cannot process modern JavaScript directly, retain a documented transpilation path and verify source maps/source locations. Evaluate replacement with NodeProf only as a separately documented design decision; do not replace the analysis backend merely because it is newer.

## Phase 4: end-to-end recovery

Recover at least these workflows, using small checked-in fixtures:

### Workflow A: runtime trace to declaration

- instrument a small CommonJS module;
- execute representative public API calls;
- produce a versioned runtime-information file;
- generate a syntactically valid `.d.ts` file;
- type-check a TypeScript client against the generated declaration.

### Workflow B: README-driven execution

- extract or use a known README example;
- execute it in the isolated environment;
- generate runtime information and a declaration;
- retain source/provenance metadata.

### Workflow C: test-driven execution

- run a small package's own tests under instrumentation;
- distinguish target-package code from test framework/dependency code;
- generate runtime information and a declaration;
- demonstrate the presence or filtering of internal test-only APIs.

### Workflow D: static/dynamic pattern analysis

- extract static patterns from a small JavaScript fixture;
- match them with runtime observations by source location;
- produce at least one type distribution;
- verify deterministic output across repeated runs.

Where an old workflow cannot be recovered, document the smallest failing example and root cause. Do not substitute mocked success for missing functionality.

## Phase 5: define stable shared formats

Before consolidation, specify versioned schemas for:

1. **Runtime observations**, including function identity, parameter/result position, shallow value type, property/call/operator interactions, source location, execution ID, and timestamp/order where needed.
2. **Provenance**, including package/version, source repository/commit, evidence source (`README`, test, client, or fixture), entry point, target/public module, and instrumentation backend/version.
3. **Generated declarations and diagnostics**, including unsupported constructs, discarded evidence, conflicts, and confidence/reason information.
4. **Patterns and type distributions**, including abstraction/version, package/file identity, occurrence counts, package-level counts, and variable positions.

Use JSON Schema or an equivalently machine-checkable format. Add fixtures and schema-validation tests. Avoid coupling shared formats to internal classes of one component.

## Phase 6: consolidate into a fresh repository

Create the fresh repository only after the source inventory and baseline results establish which components are authoritative. If no target name/path is supplied, create a local directory named `typescript-runtime-analysis` adjacent to the source checkouts, initialize Git locally, and do not create or push a remote.

Recommended structure:

```text
typescript-runtime-analysis/
  README.md
  LICENSES/
  docs/
    architecture.md
    provenance.md
    recovery-report.md
    research-directions.md
  packages/
    trace-schema/
    runtime-tracer/
    declaration-generator/
    declaration-compare/
    pattern-analysis/
    cli/
  experiments/
    fixtures/
    readme-evidence/
    test-evidence/
    pattern-prediction/
  scripts/
  .github/workflows/
```

Use npm workspaces (or another single justified workspace mechanism) and one supported Node.js version at the root. Prefer TypeScript for maintained libraries and orchestration, but do not mechanically translate stable JavaScript analysis callbacks when doing so adds risk without value.

For each imported component:

- record source repository and exact commit in `docs/provenance.md`;
- retain copyright and license notices;
- preserve its tests before refactoring;
- import the smallest coherent component rather than whole historical repositories;
- avoid copying generated results, vendored dependencies, binaries, and obsolete build output;
- explain whether it was imported, rewritten, superseded, or omitted.

The consolidated CLI should eventually expose explicit subcommands such as:

```text
trace
generate
compare
patterns
experiment
```

Do not require Kafka, Docker, or a browser for the minimal local smoke test. These may remain optional profiles.

## Phase 7: prepare both research starting points

The research scaffold must support publication-quality evaluation. Keep package identities and versions fixed, separate development/validation/evaluation data, prevent cross-package and shared-dependency leakage, retain raw observations and run metadata, and generate reported tables from checked-in scripts. Do not tune heuristics on the final evaluation set. Record toolchain versions, random seeds where applicable, exclusions, failures, and manual-labeling decisions.

### Track A scaffold: multi-source evidence

Implement or prepare interfaces for:

- ingesting several trace files;
- retaining evidence-source provenance;
- merging observations deterministically;
- filtering observations to exported/public APIs;
- running README-only, tests-only, union, and filtered-union configurations;
- reporting conflicts and unsupported types rather than silently dropping them.

Do not complete the research heuristics unless needed to establish that the architecture supports them.

### Track B scaffold: sealing-based relational signature validation

Implement or prepare interfaces for:

- retaining argument, receiver, result, callback, and outcome observations as one invocation tuple;
- expressing equality and container-element relationships among signature positions and proposing bounded candidates for generics, constrained generics, discriminated overloads, and correlated unions;
- installing fresh seals at candidate type-variable occurrences in negative positions and unsealing/checking corresponding positive occurrences;
- reversing sealing polarity across supported callback/function boundaries;
- distinguishing seal violations from ordinary exceptions, timeouts, unsupported native interactions, and harness failures;
- generating or selecting additional diverse inputs specifically to challenge proposed parametric behavior;
- refining a rejected generic hypothesis into a constraint or overloads where the counterexample and observations justify it;
- comparing component-wise union, overload-per-observation, passive relational generalization, and sealing-based validation;
- recording proposing observations, sealed trials, counterexamples, inconclusive outcomes, and refinement decisions;
- validating declarations with separate held-out valid and invalid clients.

Do not attempt full polymorphic inference or arbitrary TypeScript conditional and mapped types. First make identity-style first-order generics run end to end on fixtures with known parametric and non-parametric behavior. Treat primitive wrapping, proxy observability, coercion, `typeof`, equality, object identity, serialization, and native calls explicitly. Unsupported cases must be reported as inconclusive, not counted as passing or failing evidence.

## Testing and acceptance criteria

The task is complete only when all applicable criteria below are satisfied or explicitly documented as blocked:

- Every source checkout has an inventory entry and status.
- No pre-existing user changes were lost or overwritten.
- Relevant upstream changes and security PRs were inspected.
- Dependency/security changes have tests and written rationale.
- The supported runtime/tool versions are documented and enforced where practical.
- At least the trace-to-declaration workflow runs from a clean checkout using a small fixture.
- Generated declarations are parsed and type-checked by a current supported TypeScript compiler.
- The Track B scaffold, if feasible, demonstrates one known parametric fixture that transports a fresh seal and one observationally correlated but non-parametric fixture that produces a correctly classified seal violation; unsupported sealing interactions are reported as inconclusive.
- Shared JSON formats are versioned and validated.
- The consolidated repository installs and builds with one documented command sequence.
- Unit tests and smoke/integration tests are automated in CI.
- External package execution is isolated and resource-limited.
- The consolidated repository contains architecture, provenance, migration, and research-direction documentation.
- Each track has a concise research protocol stating its primary hypothesis, primary metric, baselines, dataset split, exclusion policy, ablations, and planned statistical analysis.
- Experimental commands retain raw results and reproduce aggregate tables without manual transcription.
- `git status` is clean at handoff, unless intentional uncommitted changes are enumerated.

## Expected handoff

Provide:

1. the fresh local consolidated repository;
2. `recovery-report.md` with the status of every source repository;
3. a migration/provenance mapping from old components to new packages;
4. a dependency/security remediation report;
5. exact installation, build, test, and smoke-test commands;
6. a short list of unresolved blockers and risks;
7. a recommendation between Track A and Track B based on the recovered software and data;
8. a proposed first two-week research milestone for the recommended track.
9. a publication-readiness plan: candidate venue types and deadlines to verify, paper claim, primary hypothesis, baselines, evaluation split, artifact contents, and a week-by-week path to a submission-ready manuscript by month five.

Lead the final handoff with what now works end to end, then list limitations. Do not claim compatibility, reproducibility, or security remediation without executed evidence.
