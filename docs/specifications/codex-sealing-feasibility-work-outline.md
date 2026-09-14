# Codex Work Outline: Early Feasibility Study for Sealing-Based Type Inference

## Objective

Extend the Proglang-TypeScript recovery project with an early, evidence-based decision on whether to pursue sealing-based validation of relational TypeScript signatures.

Do not postpone this study until after broad repository consolidation. First recover the smallest vertical slice that can load an exported JavaScript function, record complete invocation information, propose a simple relational type, rerun the function with a fresh seal, and classify the outcome. The result must support a go/no-go decision between:

- **Line A:** public-API reconstruction from heterogeneous runtime evidence; and
- **Line B:** sealing-based validation and refinement of relational TypeScript signatures.

The study must finish by the end of the third project week. Repository modernization beyond what this vertical slice needs is secondary during this period.

## Starting point and constraints

- Work in the repository workspace containing checkouts from [`Proglang-TypeScript`](https://github.com/Proglang-TypeScript) and related thesis repositories.
- Read and obey all repository-local instructions, including `AGENTS.md` files.
- Preserve all pre-existing changes. Do not reset, discard, overwrite, or silently reformat user work.
- Do not push, publish, merge pull requests, or create a remote repository without explicit authorization.
- Run untrusted package code in an isolated, resource-limited environment without host credentials or unrestricted filesystem access.
- Record exact tool versions, commands, inputs, outputs, failures, and source commits.
- A seal violation may refute a tested parametricity hypothesis. Passing finitely many tests is evidence, not proof, of parametricity.

## Required deliverables

Create the following outputs in the recovery/consolidation workspace:

1. `docs/sealing-feasibility-report.md`
2. `docs/generic-api-census.md`
3. machine-readable census results, preferably JSON or CSV;
4. sealing semantics and supported-operation documentation;
5. executable parametric and non-parametric fixtures;
6. an end-to-end sealing experiment command;
7. tests for outcome classification;
8. a week-three recommendation choosing Line A or Line B;
9. if Line B is recommended, a fixed initial benchmark and research protocol.

## Phase 0: inspect before changing

Identify the smallest set of repositories relevant to:

- runtime instrumentation;
- invocation recording;
- declaration generation;
- orchestration of package examples or tests;
- TypeScript declaration parsing and comparison;
- the exploratory `dts-auto-generate` or CEGAR-style work, if present.

For each relevant checkout, record:

- current branch, HEAD, remotes, tags, and dirty status;
- runtime and dependency expectations;
- trace formats and whether they preserve invocation identity;
- how exported functions are resolved and invoked;
- whether concrete argument values, object identities, aliasing, receivers, callbacks, results, and exceptions can be reconstructed;
- whether an execution can be repeated deterministically;
- known build, test, security, or dependency failures.

Do not consolidate unrelated historical components at this stage. Pattern-discovery and concurrency repositories should be inventoried but need not be integrated unless they directly support the feasibility study.

## Phase 1: recover the minimal vertical slice

Recover or implement the smallest workflow that can:

```text
load package export
  -> invoke function
  -> record one complete invocation tuple
  -> propose <T>(T) -> T
  -> rerun with a fresh seal
  -> classify the result
  -> emit a candidate declaration and evidence record
```

Support a checked-in local fixture first. Add a real npm package only after the fixture works.

The invocation record must associate, at minimum:

- package name, version, source commit where applicable, and entry point;
- CommonJS/ESM import mode;
- export path and property chain;
- ordinary call, method call, or constructor call;
- receiver identity for methods;
- execution and invocation identifiers;
- argument positions, shallow types, values or reconstruction recipes, and object identities;
- aliasing among receiver, arguments, callbacks, and result;
- result or thrown outcome;
- asynchronous completion information;
- callback invocations linked to the parent invocation;
- trace/instrumentation version;
- enough setup, fixture, and teardown information to repeat the call.

If the existing trace schema cannot represent these facts, introduce a versioned extension with validation fixtures. Do not silently reinterpret an existing schema.

## Phase 2: corpus census of candidate generic APIs

Analyze a pinned, current snapshot of DefinitelyTyped using the TypeScript compiler API. The census must be reproducible from a clean checkout.

### Unit of analysis

Count exported callable API declarations, not arbitrary internal functions. Document the treatment of:

- exported functions;
- callable objects and interfaces;
- methods of exported classes and interfaces;
- constructors;
- overloaded declarations;
- declarations generic only through an enclosing class or interface;
- re-exports and duplicate declarations;
- module augmentations and global declarations.

### Required counts

Report:

1. total exported callable declarations;
2. declarations with type parameters;
3. declarations with a type parameter occurring in both negative and positive positions;
4. independent packages represented by those declarations;
5. candidates in each initial class:
   - identity relationship, such as `T -> T`;
   - container element relationship, such as `T[] -> T`;
   - value-to-container relationship, such as `T -> T[]`;
   - relationship among multiple arguments;
   - constrained generic;
   - higher-order/callback relationship;
   - overload or discriminated relationship;
   - unsupported.
6. corresponding JavaScript packages and exact versions that are obtainable;
7. candidates whose exports can actually be loaded and exercised safely.

Deduplicate counts at declaration, export, and package level. Retain the extraction reason and source location for each candidate so classifications can be audited.

### Census validation

- Add unit tests for polarity traversal and classification.
- Manually inspect a stratified sample from every supported class.
- Report false classifications and ambiguous declarations.
- Do not use the final evaluation set to tune later sealing rules.

## Phase 3: specify the initial sealing semantics

Write a precise operational description for the supported fragment before general implementation.

Start with first-order candidates such as:

```ts
<T>(x: T): T
<T>(xs: T[]): T | undefined
<T>(x: T): T[]
```

For each candidate type-variable occurrence:

- seal values placed in negative positions using a fresh, unforgeable seal;
- unseal and check corresponding values in positive positions;
- reverse polarity when crossing a supported function boundary;
- preserve and check identity when the hypothesized relationship requires it;
- reject attempts to inspect, coerce, destructure, compare, serialize, or otherwise use an opaque value unless the candidate constraint explicitly permits the operation.

Document exact decisions for:

- strings, numbers, booleans, symbols, bigints, `null`, and `undefined`;
- ordinary objects, arrays, functions, promises, iterators, and callbacks;
- proxies and proxy observability;
- `typeof`, `instanceof`, equality, property access, enumeration, and coercion;
- mutation and aliasing;
- object identity and use as `Map`/`Set` keys;
- JSON and structured cloning;
- native and host functions;
- synchronous exceptions, rejected promises, timeouts, process termination, and nondeterminism.

Do not classify an unsupported interaction as evidence for or against parametricity.

## Phase 4: build discriminating fixtures

Create paired fixtures whose ordinary shallow traces appear similar.

### Required parametric fixtures

- direct identity;
- identity through a local variable or helper;
- element selection from a container without inspecting the element;
- wrapping an opaque value in a container;
- at least one asynchronous transport case, if supported.

### Required non-parametric lookalikes

- branching on `typeof`;
- string/number coercion;
- arithmetic followed by reconstruction;
- property inspection;
- equality comparison;
- serialization and reconstruction;
- returning a newly manufactured value of the observed type;
- a type-directed implementation that produces `string -> string` and `number -> number` in ordinary executions.

### Required inconclusive fixtures

- ordinary unrelated exception;
- timeout;
- unsupported native interaction;
- harness/setup failure.

Tests must verify that the system distinguishes:

```text
SUPPORTED            successful transport/unsealing
SEAL_VIOLATION       refutation of the tested hypothesis
SEMANTIC_MISMATCH     execution completes but the required relation fails
INCONCLUSIVE          unsupported interaction or unrelated failure
HARNESS_ERROR         experiment infrastructure failed
```

Do not merge these outcomes into a single pass/fail flag.

## Phase 5: active experiment driver

Provide one documented command, for example:

```text
experiment seal --package <name> --export <path> --candidate <candidate>
```

The driver must:

1. resolve and load the specified export;
2. collect or import ordinary invocation observations;
3. propose or accept a bounded relational candidate;
4. generate a fresh seal for every independent trial;
5. generate or select additional inputs designed to challenge the candidate;
6. execute each trial in isolation;
7. classify the outcome using the taxonomy above;
8. retain raw evidence and a reproducible invocation recipe;
9. produce a human-readable explanation;
10. emit a candidate TypeScript declaration only when the configured evidence threshold is met.

Vary type, value, object shape, aliasing, and relevant control-flow path. Replaying only the calls that suggested the candidate is insufficient.

Never claim that a candidate is universally parametric. Report the number and diversity of successful trials, counterexamples, and inconclusive outcomes.

## Phase 6: real-package pilot

After all fixture tests pass, select a small development corpus of real packages from the census. Keep it separate from the eventual held-out evaluation corpus.

For each selected export:

- reproduce at least one ordinary call;
- record the complete invocation tuple;
- propose a relational candidate from ordinary observations or the reference declaration;
- generate additional sealed trials without consulting held-out clients;
- record counterexamples, successful unsealing, inconclusive interactions, and runtime overhead;
- determine whether a rejected generic can reasonably be refined into a constrained generic or overloads.

Manually inspect every pilot result. Use this pilot to refine the supported semantics and experimental harness, but freeze the rules before any final evaluation.

## Go/no-go decision at the end of week three

Recommend **Line B** only if all mandatory conditions hold:

1. The census finds at least 100 executable exported functions with supported relational signatures from at least 25 independent packages, or provides a comparably convincing benchmark justification.
2. A fresh seal passes through the required known-parametric fixtures.
3. The observationally similar non-parametric fixtures produce correctly attributed seal violations or semantic mismatches.
4. Ordinary exceptions and unsupported interactions are reliably classified as inconclusive rather than as parametricity evidence.
5. The instrumentation does not introduce unmanageable differences involving proxies, primitives, identity, native calls, or module loading.
6. Real package exports can be resolved and rerun with sufficiently reproducible setup.
7. Complete invocation tuples and replay recipes can be retained in a stable schema.
8. Enough project time remains for benchmark construction, held-out evaluation, artifact preparation, and a submission-ready paper.

If any mandatory condition fails, recommend **Line A** and preserve the sealing prototype as a documented exploratory result. Do not weaken the criteria after inspecting the outcome merely to justify Line B.

## Research protocol if Line B proceeds

Freeze a protocol containing:

- supported candidate language;
- sealing semantics and outcome taxonomy;
- development and held-out package sets;
- hypothesis-generation executions, sealed-testing executions, and held-out validation clients;
- union, overload-per-observation, and passive-correlation baselines;
- primary hypothesis and metric;
- minimum useful coverage threshold;
- secondary metrics, including seal violations, inconclusive rate, declaration precision, valid-client acceptance, invalid-client rejection, declaration size, stability, and overhead;
- ablations for sealing, test diversity, candidate rules, and ranking signals;
- exclusion and failure policies;
- manual-inspection procedure;
- scripts that reproduce all aggregate tables from raw results.

The intended primary hypothesis is:

> Polarity-directed sealing rejects a substantial fraction of false parametric hypotheses proposed from ordinary correlations and thereby improves relational-signature precision or held-out client compatibility over passive correlation, without reducing useful coverage beyond a fixed threshold.

Choose the precise primary metric and numerical thresholds after the development pilot but before evaluating the held-out set.

## Updates to the consolidated repository

If consolidation proceeds, ensure the new repository contains or provides stable interfaces for:

```text
packages/
  trace-schema/
  runtime-tracer/
  invocation-replay/
  sealing-runtime/
  relational-candidates/
  declaration-generator/
  cli/
experiments/
  census/
  sealing-fixtures/
  development-packages/
  held-out-packages/
docs/
  sealing-semantics.md
  generic-api-census.md
  sealing-feasibility-report.md
```

Do not force this structure if the recovered components justify a simpler one. Preserve source provenance, licenses, exact imported commits, and regression tests.

## Final acceptance criteria

The work is complete only when:

- the census is reproducible and its classifications have automated and manual checks;
- complete invocation tuples can be recorded and replayed;
- the outcome taxonomy is implemented without conflating inconclusive runs with evidence;
- required parametric, non-parametric, and inconclusive fixtures pass;
- at least one real package export runs through the complete ordinary-observation and sealed-testing workflow;
- all pre-existing user changes remain intact;
- exact setup, build, test, census, and experiment commands are documented;
- the feasibility report gives an evidence-based Line A/Line B recommendation against the fixed criteria;
- limitations and unsupported JavaScript interactions are explicit;
- the repository is clean at handoff, unless every intentional uncommitted change is enumerated.

## Final handoff

Lead the handoff with:

1. what works end to end;
2. the census result;
3. examples of a passing parametric fixture and a rejected non-parametric lookalike;
4. the principal instrumentation limitations;
5. the go/no-go decision and evidence for it;
6. the exact next two-week milestone for the selected research line.

Do not claim parametricity, soundness, compatibility, reproducibility, or security remediation beyond the evidence actually obtained.
