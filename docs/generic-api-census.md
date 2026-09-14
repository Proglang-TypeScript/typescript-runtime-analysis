# Phase 2: exported generic API census

## Scope and input

The checked-in `experiments/census/snapshot.json` pins DefinitelyTyped commit `455254aa7204192e7f7fbe50266d2313cefdf6c9`, resolved on 2026-09-14, containing 8,680 type-package directories. The six-package sparse smoke selection is development/infrastructure data, **not the full census or a held-out benchmark**. The supplied feasibility outline is retained under `docs/specifications`.

Use Node24 and the lockfile's TypeScript6 compiler API. No DefinitelyTyped dependencies or runtime packages are installed. Extraction only parses/checks declaration files. Module/type-reference resolution is confined to declarations in the pinned `types/` tree plus the installed compiler's standard libraries, excluding host/DT node_modules. Missing external declaration dependencies remain compiler diagnostics, not fabricated complete types. Compiler analysis uses strict ESNext/Bundler options; it does not reproduce every package's own test tsconfig.

## Commands from a clean checkout

```sh
npm ci
npm run build
# Small, fast infrastructure check; fetches only six development packages.
npm run census:prepare -- --out work/dt-smoke --smoke
npm run census -- --snapshot work/dt-smoke --out work/census-smoke
# Full input and census. Fetch is larger; extraction can run for hours.
npm run census:prepare -- --out work/definitelytyped
npm run census -- --snapshot work/definitelytyped --out work/census --time-limit-hours 4
# Resume exactly the same pin/compiler/implementation/selection/seed.
npm run census -- --snapshot work/definitelytyped --out work/census --time-limit-hours 4 --resume
npm run census:aggregate -- --out work/census
```

To analyze a development subset of a full checkout, add `--packages lodash,d3-array`. A sparse checkout is never labeled full corpus, even when every available sparse directory is selected. Setup requires Git/GitHub network access; extraction and aggregation are offline. The existing checkout must match the exact pin/origin and be clean; setup refuses to overwrite it. Failed partial setup is preserved: choose a new directory or inspect/fix it explicitly. Existing output requires explicit `--resume` and identical provenance/configuration; changed rules require a fresh output directory.

Each package is extracted in a separate worker with a 1 GB V8 heap, a two-minute deadline and a 64 MB output cap. Failed/missing entries retain an explicit zero-row failure shard and make the census command nonzero; they are not negative research results. Resume retries failed shards. Successful package shards avoid repeated compilation. An implementation hash and final input/implementation recheck prevent unnoticed rule/input drift. Aggregation streams shards to JSONL/CSV rather than holding all declarations/programs in memory; distinct-ID sets still consume memory proportional to the corpus. For unusually large corpora increase the parent Node heap deliberately, not worker limits silently.

### Timed checkpoints and the complete resume call

`--time-limit-hours HOURS` is an optional finite positive number, including fractions such as `0.5`. The budget starts when each invocation begins and is checked after each complete package worker (including all of that package's declared module entry points), after its shard is saved by atomic rename. It does not interrupt a module mid-extraction. The package boundary is the existing unit of resume; there are no intra-package checkpoints. A worker may exceed the remaining budget up to its existing two-minute deadline; checkpoint validation adds overhead. Final aggregation is outside this extraction budget.

If the budget expires with packages remaining, the command validates the input/implementation, writes `checkpoint.json` with identity, state, invocation budget/elapsed hours, processed/successful/failed/pending packages, and exits normally (zero unless extraction failures occurred). Completed shards remain under `packages/`. Summary tables and the review queue are deferred until all selected packages have been processed; a timed checkpoint is **not** a completed census. `checkpoint.json` is also written at extraction completion. Without this option the run continues through the whole selection.

From the repository root, the full resume command for the four-hour full-corpus example is:

```sh
npm run census -- --snapshot work/definitelytyped --out work/census --time-limit-hours 4 --resume
```

For a selected-package run with a nondefault review size, repeat those options too:

```sh
npm run census -- --snapshot work/definitelytyped --out work/census-subset --packages lodash,d3-array --review-size 10 --time-limit-hours 4 --resume
```

Use the original snapshot and output directory, identical package selection and review size, and unchanged pinned input/compiler/software. Check `run.json` for the original selection, review size and command. Preparation need not be repeated. Successful validated shards are skipped; failed shards are retried. The time limit is an invocation setting, not part of census identity: it may be changed or omitted on resume, and each invocation gets a fresh budget. Runs made with an earlier software implementation cannot be resumed with changed software; use the original version to finish those runs, or start a fresh output directory with this version. Manual aggregation requires every selected shard to exist and does not turn a partial checkpoint into a full census.

## Unit, deduplication and classifications

The unit is an explicit callable signature declaration reachable from a public declaration-module export, not an arbitrary function anywhere in a source file. Counts describe **formal source declarations**, not proof of freely instantiable runtime generics.

| Form | Treatment |
|---|---|
| Exported function/default/namespace export | Resolve compiler export symbols and aliases; collect public call signatures |
| Callable exported object/interface/type alias | Collect call signatures; label type-only interfaces/aliases distinctly |
| Public class/interface methods and callable properties | Collect instance/static/member signatures; exclude private/protected/private-name members |
| Constructors | Count explicit construct/constructor signatures, including constructable interfaces/aliases; implicit class constructors without declaration signatures are excluded; replay unsupported |
| Overloads | Each signature declaration is one declaration; group by export ID and retain overload count |
| Enclosing class/interface/alias generics | Retain scoped formal parameters and constraints; shadowed inner parameters replace outer ones; static methods do not inherit class parameters; separate own/enclosing counts |
| Re-exports and aliases | Follow checker aliases. Canonical declaration ID = source file/start; export ID = package/module specifier/property chain/kind/binding. One source declaration may support many exports |
| Subpaths/conditional entries | Include primary types/typings (including extensionless paths) and explicit declaration targets in unversioned manifest exports; deduplicate equivalent targets. Wildcard expansion, alternate typesVersions/types@ branches and implicit deep imports require review and are not silently claimed covered |
| Ambient modules | Count exported signatures in loaded package-owned ambient module files, keyed by module specifier; equivalent source declarations deduplicate across aliases |
| Module augmentations/global declarations | Inventory exclusions with source locations; do not mix augmentation/global-only functions into the module-export denominator; export-as-namespace aliases do not duplicate module counts |
| Builtin/standard-library declarations | Not census declarations; library files may supply checking context. The Node declaration package has no automatically asserted npm-runtime mapping |

Rows retain stable IDs, source line/column/start, declaration text, extraction reason, runtime binding, module/export chain, all formal type parameters/constraints, occurrence paths/polarities and unsupported reasons. Computed property names retain source expressions such as `[Symbol.iterator]`, not compiler-internal symbol IDs; their runtime resolution requires manual/unsupported handling. Package shards preserve manifest owners/projects and contributing source hashes/leading/attribution comments alongside the original DefinitelyTyped license. A generic formal parameter through an enclosing/specialized context is not asserted to be a free generic at a runtime export.

Negative positions start at parameters; positive positions start at results. Function parameters flip polarity recursively and results preserve it. Arrays/ReadonlyArray/readonly arrays and union branches preserve traversal polarity; readonly structural fields preserve it. Known type aliases expand with substitution and recursion/budget guards. Nested generic shadowing is tracked. Unknown reference variance, mutable/indexed fields, conditional/mapped/tuple/operator forms outside this fragment produce unknown occurrences and unsupported reasons, **not invented negative-and-positive occurrences**. Bounds are retained but not treated as argument/result occurrences. This is a bounded declaration-position analysis, not a complete TypeScript variance or semantic parametricity proof.

Class tags are non-exclusive: identity, container-element, value-to-container, multiple-arguments, constrained-generic, higher-order, overload-or-discriminated and unsupported. Their sum need not equal total declarations. An identity tag records a positional relationship (possibly a union projection), not automatically an exact `<T>(T)->T` sealing contract. `firstOrderPotential` is only an initial syntactic shortlist with no enclosing formal parameters or unsupported forms; it does not establish executable exports or existing kernel support. Every generic candidate needs source/client/runtime review before becoming a pilot API.

## Outputs and validation

- `run.json`: exact Git pin/origin/scope, compiler, implementation hash, selection, seed, command and worker limits.
- `packages/*.json`: version1 validated declaration/export records, entry hashes, compiler diagnostics, exclusions and worker failures. Diagnostic counts include per-entry checks; retained diagnostic samples are separately counted/capped.
- `declarations.jsonl` / `declarations.csv`: auditable rows. `summary.json` / `summary.csv`: deduplicated declarations, exports and packages; own/enclosing generics, both polarities and each class; all failure/diagnostic denominators.
- `review-queue.json`: deterministic hash-ranked, declaration-deduplicated sample per class (default five; `--review-size` sets 1–100). Samples remain development data.

Prepare a separate `reviews.json` with the queue's `identity` and reviewed `records`, each containing `reviewId`, `status`, `reviewer`, `notes`. Status is agree, false-classification, ambiguous or excluded. Do not label pending rows reviewed. Inspect the complete source declaration, alias/enclosing scope and overload/export context, not just its displayed text. Prefer two independent reviewers. Keep disagreements/false classifications, then change rules only using development data and rerun into a fresh directory. All supported classes and unsupported controls need inspection before trusting the full census.

```sh
npm run census:review -- --out work/census --reviews work/reviews.json
```

This validates census identity, duplicate/unknown review IDs and required reviewer/notes; `review-assessment.json` counts reviewed/ambiguous/false/pending cases. Reaggregation never overwrites user `reviews.json`. Automated tests cover polarity flips, alias substitution/shadowing, export forms, constructor/private/global exclusions, subpaths, overload/declaration/export deduplication, diagnostics, strict shard validation and deterministic review/aggregation.

## Runtime-package availability is separate

The default census makes **no network queries or executable claims**. After reviewing package mappings, explicitly query selected public npm metadata:

```sh
npm run census:availability -- --census work/census --packages d3-array,lodash --out work/census-availability
```

The helper uses an empty user configuration, isolated cache/home and explicit public registry, without host credentials. It makes at most fifty selected-package lookups per command, each bounded to twenty seconds. It chooses the latest stable exact version in the declaration major/minor line, never treats DefinitelyTyped's `.9999` as a JavaScript version, and retains exact name/version, HTTPS tarball URL, SHA512 integrity, repository/gitHead when supplied, raw metadata, commands, errors and response hashes. Version-line lookup is a reproducible matching heuristic, not compatibility proof. If absent/mismatched, provide a separately reviewed `--versions FILE` mapping directory to exact version or retain the failure. Metadata-unavailable includes query/policy failures; it is not proof a package cannot be obtained.

`catalog.json` references the census identity and records distinct metadata-obtainable runtime packages. Combine its count with declaration counts by this identity; the extraction summary's availability remains unassessed. **Metadata availability is not loaded/exercised safety or executability.** Do not set booleans based on shape or npm availability. The census shard schema deliberately leaves execution not-assessed; reviewed execution is a separate version1 assessment, never a reinterpretation of those rows.

## Reviewed runtime evidence intake

After an actual isolated ordinary call, prepare a separate assessment file:

```sh
npm run census:runtime -- --out work/census --catalog work/census-availability/catalog.json --assessment work/pilot-evidence/assessments.json
```

The file contains `schemaVersion:1`, the matching `censusIdentity`, and `records`. Each record identifies a census `exportId` and status: reviewed-loaded-and-exercised, load-failed, exercise-failed, unsupported or not-assessed. Non-pending records require `reviewer` and `notes`. Positive records additionally require the exact catalogue `package` name/version/integrity, `isolationProfile:"run-isolated-v1"`, `runnerExitCode:0`, `observedOutcome:"returned"`, and `evidence` entries for dependency-lock, invocation-recipe and execution. Each evidence entry contains kind, relative path and SHA256; files/symlinks must remain inside the assessment directory and hashes must match. Type-only declarations, missing receipts, mismatched versions/identities, duplicate exports and changed artifacts cannot count as executable.

Retain the complete actual container command/limits/image, tool/source/lock hashes, import/property chain, receiver/setup/arguments, successful outcome and teardown in those receipts. The existing `scripts/run-isolated.cjs` supplies the credential-free network-disabled ordinary tracing profile; prepare reviewed frozen dependencies with lifecycle scripts disabled first. This intake **does not generate calls or prove a handwritten isolation/result claim**. Reviewers must inspect the actual artifacts and source/recipe and attest the isolation/call correspondence. It is a validated human-evidence intake, not automatic runtime certification. Synthetic unit-test receipts never contribute to study counts.

`runtime-assessment.json` reports all failure/unsupported/pending statuses separately and deduplicates successful exports/packages. Unrecorded exports remain not-assessed. Distinct npm names are nominal packages, not proven independent source families. The retained development smoke has no positive runtime records and its verified-executable count remains zero. Arbitrary automatic argument generation and complete async/constructor/method replay remain later-phase work.

Before runtime checks, freeze exact package/dependency locks/integrities and export/setup/input recipes, and use the existing credential-free, network-disabled resource-limited container runner. Nothing in the census runs package code. Keep all smoke/development/pilot packages separate from a later untouched held-out evaluation set. The outline's 100 executable functions / 25 independent-package criterion cannot be evaluated from syntactic or metadata counts alone; family/source independence also needs manual validation.
