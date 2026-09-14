# Census infrastructure

The fresh full rerun is complete: 8,680 packages, zero fatal extraction failures, one explicit partial-entry package. See [the repaired census report](docs/census-repaired-followup.md) for counts, preserved-baseline checks and the pending human-review pack.

Independent human reviewers should start with [the structured review guide](docs/human-review-guide.md). It defines ten questions per sampled category, separate runtime/source-family worksheets, two blind reviews, and explicit disagreement/adjudication handling.

Current worker/canonical shards use lossless template/reference storage (`storageVersion: 1`), expanding to the existing logical row schema via `packages/generic-api-census/shard-codec.cjs`. Every declaration/export pair is retained; independent aliases are not dropped. Legacy expanded shards remain readable for aggregation, but changed software still requires a fresh run identity. The 256 MB worker-file, 1 GB worker-heap, two-minute worker and 1 MB log limits remain enforced. This is compact storage, **not fully streamed extraction**; aggregation emits expanded JSONL/CSV and can require a larger parent heap.

Missing declared variants now report `partial-entry` when at least one selected entry exists. `entryCoverage` names absent files/conditions. The summary separates `incompleteEntryPackages` from fatal `extractionFailures`; completion can have either, and the command exits nonzero for either. Resume reuses an unchanged partial shard without claiming the missing branch was repaired. The pinned input is never fabricated or edited to conceal a missing ESM declaration.

This infrastructure performs an automated census of public callable TypeScript declarations, followed by human classification review and separately reviewed runtime evidence. It is not an automatic executable benchmark or a proof of parametricity. Detailed conventions and evidence formats are in [the census documentation](docs/generic-api-census.md); the study outline and remaining gates are in [the feasibility report](docs/sealing-feasibility-report.md).

## Requirements and preparation

Run commands from the repository root with Node.js 24, npm and Git available:

```sh
npm ci
npm run build
npm run census:prepare -- --out work/definitelytyped
```

Preparation needs GitHub network access. Declaration extraction and aggregation are offline and do not install or execute DefinitelyTyped packages or their JavaScript implementations. The snapshot pins DefinitelyTyped commit `455254aa7204192e7f7fbe50266d2313cefdf6c9`, containing 8,680 type-package directories. An existing snapshot must match the pin/origin and have a clean checkout; preparation refuses to overwrite conflicting work.

### Clone strategy

The snapshot uses a **shallow, blobless fetch, not a treeless clone**:

```sh
git fetch --filter=blob:none --depth=1 origin <pinned-commit>
```

Git retains tree metadata while initially omitting file contents. Checkout fetches the required contents. Full mode checks out the pinned repository normally, so most file contents must eventually be downloaded; blobless fetching does not make the full census input tiny. Smoke mode adds a cone-mode sparse checkout for six package directories, plus root files.

For a separate development smoke run:

```sh
npm run census:prepare -- --out work/dt-smoke --smoke
npm run census -- --snapshot work/dt-smoke --out work/census-smoke --time-limit-hours 0.5
```

Smoke data is not the full census or an untouched held-out benchmark. Do not reuse full-mode snapshot/output directories for smoke mode.

## Starting and checkpointing a census

Start a full run with a four-hour extraction budget:

```sh
npm run census -- --snapshot work/definitelytyped --out work/census --time-limit-hours 4
```

`--time-limit-hours HOURS` is optional and accepts a finite positive number, including fractions such as `0.5`. Without it, extraction continues through the selected corpus.

The budget is measured with a monotonic clock from the start of each invocation and checked after each complete **package**, including all of its declared module entry points. This is the existing worker/resume unit; individual submodules within a package do not have separate checkpoints. The current worker finishes and its shard is saved by atomic rename before a timed stop. A worker may exceed the remaining budget up to its existing two-minute deadline; checkpoint validation adds overhead. Final aggregation is outside the extraction budget.

If the time limit is reached with packages remaining, input/software validation runs and `checkpoint.json` records the census identity, state, invocation command/budget/elapsed time, and processed/successful/failed/pending packages. Completed shards remain in `packages/`. The command exits normally, with exit code zero unless extraction failures occurred. A timed checkpoint is not a completed census; final summary tables and the review queue are deferred until every selected package has been processed. Extraction completion also writes `checkpoint.json`.

Each package worker has a 1 GB V8 heap, a two-minute deadline and an explicit 256 MB file-output cap, with temporary-file transport and a separate 1 MB diagnostic log cap. The original baseline used a 64 MB stdout pipe. Recursive namespace alias cycles are inventoried and cut on the current ancestor path without discarding independent aliases. Extraction failures remain explicit failure shards, rather than being interpreted as packages without callable APIs. Compiler diagnostics are recorded separately from worker failures. New rules/transport require a fresh census identity and output directory; the original full run stays preserved.

## Complete resume commands

For the four-hour full-corpus example above, from the repository root:

```sh
npm run census -- --snapshot work/definitelytyped --out work/census --time-limit-hours 4 --resume
```

For the smoke example:

```sh
npm run census -- --snapshot work/dt-smoke --out work/census-smoke --time-limit-hours 0.5 --resume
```

If the original run used a package subset or a nondefault review size, repeat them too:

```sh
npm run census -- --snapshot work/definitelytyped --out work/census-subset --packages lodash,d3-array --review-size 10 --time-limit-hours 4
npm run census -- --snapshot work/definitelytyped --out work/census-subset --packages lodash,d3-array --review-size 10 --time-limit-hours 4 --resume
```

Resume requires the original snapshot/output directory, identical package selection and review size, and unchanged pinned input, compiler and implementation. Consult `run.json` for the original selection, review size and command. Preparation need not be repeated. Successful validated shards are skipped; failed shards are retried. Existing unrelated output is never silently overwritten.

The time limit is an invocation setting, not part of census identity. It may be changed or omitted on resume; each invocation gets a fresh budget. Runs created with an older implementation must be finished using that original software, or restarted into a fresh output directory with the new implementation. This includes runs created before timed-checkpoint support.

After extraction completes, regenerate the tables and review queue if needed:

```sh
npm run census:aggregate -- --out work/census
```

Manual aggregation requires every selected shard to exist; it does not promote a partial checkpoint into a full census. Reaggregation leaves user-owned review inputs untouched.

## How signatures are assessed

The TypeScript compiler API resolves public module exports, aliases and callable signatures. Extraction covers exported functions, callable objects/types, public members, explicit constructors and declared subpath entries. Overloads remain separate signature declarations. Private/protected members are excluded; global/module augmentations are inventoried separately rather than mixed into the module-export denominator. Type-only declarations are distinguished from runtime value bindings.

Canonical declaration IDs deduplicate source declarations; separate export IDs preserve multiple public paths to the same declaration. Rows retain source locations/text, scoped formal type parameters and constraints, occurrence paths, classification reasons and unsupported forms. Generic parameters inherited through enclosing types are not assumed freely instantiable at runtime.

Polarity analysis starts function arguments negative and results positive. Nested function arguments flip polarity and nested results preserve it. Arrays, unions and readonly structural fields preserve traversal polarity under the census rules. Known aliases expand with substitution and recursion/budget guards; nested generic shadowing is tracked. Unknown generic variance and unsupported mutable/indexed, conditional/mapped/tuple/operator forms remain unknown, not invented evidence of both polarities. Constraints are recorded separately from argument/result occurrences.

For example, `<T>(value: T) => T` places `T` negatively and positively and produces an identity-like candidate. Nonexclusive tags include identity, container-element, value-to-container, multiple-arguments, constrained-generic, higher-order, overload-or-discriminated and unsupported. These tags describe declaration shape, not semantic guarantees. `firstOrderPotential` is only a syntactic shortlist, not proof of executability or sealing-kernel support.

Type resolution is restricted to the pinned declaration tree and compiler standard libraries. Missing external dependencies remain visible diagnostics. The strict ESNext/Bundler analysis does not reproduce every package's own test configuration, and wildcard/version-dependent entry variants require additional review.

## Manual intervention and runtime assessment

No signature-by-signature intervention is necessary to run extraction, classification, checkpointing or aggregation. Human review is required before trusting the census or promoting candidates:

- Inspect deterministic declaration-deduplicated samples from every class, including unsupported controls. The default sample is up to five per class; `--review-size` accepts 1–100. Prefer two independent reviewers and preserve disagreement/false/ambiguous classifications.
- Review diagnostics, aliases, enclosing generics, overload/export context and unresolved or alternate entry variants. Rule changes must use development data and a fresh output directory.
- Check declaration-to-runtime package/version compatibility. Anonymous public npm metadata lookup is opt-in and automated, but version-line matching is only a heuristic; metadata availability does not prove safe or executable APIs.
- Prepare actual import/property-chain, receiver/setup and argument recipes with frozen exact dependency locks. Run ordinary calls in the existing credential-free, network-disabled, resource-limited container profile. The census does not automatically generate calls.
- Inspect runtime receipts and attest the isolation/call correspondence. Evidence intake checks exact catalogue identity/version/integrity and SHA256 hashes of lock, invocation-recipe and execution artifacts; it does not prove that handwritten success/isolation claims are true.
- Curate independent source/package families and an untouched held-out evaluation set. Distinct npm names alone do not establish independence.

The corresponding commands, after preparing the separate review/evidence files, are:

```sh
npm run census:review -- --out work/census --reviews work/reviews.json
npm run census:availability -- --census work/census --packages d3-array,lodash --out work/census-availability
npm run census:runtime -- --out work/census --catalog work/census-availability/catalog.json --assessment work/pilot-evidence/assessments.json
```

Review records require known review IDs, a status, reviewer and notes. Runtime records are separate from declaration rows and retain success, load/exercise failure, unsupported and unassessed statuses. A type-only export cannot directly count as executable. Positive records need reviewed successful execution, not merely loading or obtaining npm metadata. See the detailed census documentation for the exact input formats and receipt requirements.

## Validation and outstanding study work

The later [corpus follow-up report](docs/census-followup.md) records publication of the compact full baseline, recovery of 19 failed packages, diagnostic priorities, the single-agent 40-item review and five actual ordinary pilot APIs. The repaired full corpus and independent human/family validation are still pending; the initial timed-checkpoint and smoke records below remain historical.

Timed-checkpoint support was validated with 110 preserved Jest assertions plus 54 Node tests: **164 passed, zero failed**. Added tests cover fractional/invalid budgets, clean package-boundary stops, changed-budget resume, identical uninterrupted results, stale shard/configuration rejection, preserved review inputs and failed-worker retries. An actual offline d3-array/underscore CLI run stopped after d3-array and resumed to successful two-package aggregation.

The retained six-package development smoke under `experiments/results/census-smoke` predates this follow-up and is not a full study. It has sixteen pending classification reviews and 5,236 runtime-not-assessed callable exports, with no positive runtime records. React's unresolved external `csstype` declaration dependency remains visible. Full-corpus extraction, independent reviews, runtime recipes/evidence, family-independence checks and held-out curation remain pending. The outline's 100 executable functions / 25 independent packages gate cannot be evaluated from syntactic counts or npm metadata alone.
