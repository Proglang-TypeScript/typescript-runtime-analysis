# Polarity-directed sealing scaffold

## End-to-end workflow

Run `npm ci && npm run check` on Node24. `npm run experiment:sealing` independently runs the active Track B workflow and regenerates `experiments/results/sealing/{tables,trials}.csv`. Build first when running the experiment alone. The retained passive workflow is `npm run experiment:relational`.

The first-party inference client records actual invocation tuples. `packages/sealing/proposals.cjs` proposes bounded unary identity hypotheses from at least two aligned argument/result observations, with invocation IDs and full provenance. Homogeneous object observations may propose a hypothesis, but cannot establish parametricity. Proposing support is capped at 128 invocations. `challenge` selects nine concrete inputs across number, string, boolean, null, undefined, object and array families; it uses a fresh worker and seal instantiation for every challenge. Challenges are development evidence, distinct from held-out evaluation clients.

The experiment keeps proposals, raw observations, sealed trials, concrete controls, classified counterexamples, non-counted outcomes, refinement decisions, declarations, independent compiler diagnostics, source hashes and script-generated tables. It compares component unions, observation overloads, passive relational generalization and active sealing/refinement. All four declarations are independently checked for validity. API TypeScript6 and native TypeScript7 check the active held-out valid client; separate invalid and constraint-invalid clients must be rejected. Neither client feeds proposal or refinement.

## Boundary contract

`packages/sealing/index.ts` creates an unforgeable WeakMap brand per type variable per instantiation. The same T brand is shared across its occurrences; different variables and trials cannot substitute brands. Negative T occurrences seal incoming concrete payloads; positive T occurrences check the exact brand and unseal the original payload. Each incoming occurrence receives an opaque token, not a transparent JavaScript representation. Primitive boundary terms retain their concrete type checks. Function terms reverse parameter polarity and retain result polarity recursively. An incoming callback receives unsealed T and its result is resealed; a returned function seals client arguments and unseals provider results.

The worker supports direct synchronous identity callbacks via finite client descriptors. Returned-function polarity is unit-tested in the kernel, but worker trials without subsequent calls report inconclusive. Arbitrary callback generation, container traversal terms, full polymorphism, async, receivers, constructors and conditional/mapped types are not implemented. Unsupported type terms report inconclusive.

Opaque proxies deliberately do not pretend to preserve primitive `typeof`, truthiness, equality, identity, coercion or native-brand behavior. A conservative TypeScript AST preflight classifies those operations, branching/loops, serialization/reflection, callback introspection, unknown helper/native calls, default/rest/destructured parameters and unsupported function forms as inconclusive. It may exclude operations on unrelated concrete operands: this conservative coverage loss is explicit, not evidence against a candidate. Runtime traps classify coercion, reflection, mutation and primitive/container property wrapping as inconclusive. Plain-object field inspection is a seal violation; permitted constrained fields are shallow own data properties. Caught faults remain sticky in the event ledger and cannot become passes.

The current automatically proposed constraint is a single readonly-accessible string field supported by every complete proposing object and an opaque-field counterexample. It is challenged again with two distinct admissible objects. It does not establish arbitrary getters, nested records, mutation or proxy compatibility. A rejected generic without such support falls back to shallow observation/counterexample overloads, conservatively retaining all known output types. These overloads are explicitly **not sealing-validated** or universally sound. Existing passive container/discriminated/correlated-union synthesis remains available, but active validation does not claim to cover those type forms yet.

## Outcomes and executed fixtures

Version1 trial JSON validates events, concrete controls and six distinct outcomes:

| Outcome | Meaning |
|---|---|
| passed | Supported fresh-seal transport completed without a recorded fault |
| seal-violation | Missing/wrong brand, supported opaque inspection or concrete positive type mismatch |
| exception | Ordinary exception from concrete control or supported sealed execution |
| timeout | Worker exceeded its deadline |
| inconclusive | Unsupported semantic/native/proxy interaction; neither pass nor counterexample |
| harness-failure | Invalid input/contract/export, failed worker or invalid protocol |

Concrete controls use separate structured-cloned payloads, then reload the entry module before sealed execution. They expose ordinary exceptions without blaming seals. Dependency caches, external/global state and nondeterminism are not fully reset; the demonstrated fixtures are dependency-free. Any such real-package validation needs a separately reviewed harness profile.

Known `identity` transports seals on all nine challenges. `nonParametric` only coincides with inputs because inference explicitly configures a constant; independent fresh-module challenges produce nine `MISSING_OR_WRONG_SEAL` violations, without relying on primitive wrapping artifacts. `tagIdentity` yields a supported object-field violation, six inconclusive primitive/container interactions and two ordinary concrete exceptions. Its justified `{tag:string}` constraint passes two admissible challenges. A direct callback fixture passes with reversed polarity; seven explicit observability/native fixtures are inconclusive. Unit tests also execute a real bounded timeout, a missing-export failure and caught faults.

Only supported violations are counterexamples. A candidate is rejected if one occurs, accepted on supported trials only when at least two trials all pass, otherwise inconclusive. Keep non-counted outcomes visible even when another trial rejects a hypothesis. Finite challenges are not universal soundness, a leakage-free corpus or publication-quality evidence.

## Isolation and CLI

The worker has a 128 MB V8 heap limit, a default three-second deadline (maximum thirty seconds), a 1 MB output cap, no shell and an environment restricted to PATH/TZ. These are process resource controls, **not a security sandbox**; providers can access their enclosing filesystem. `trustedFixture` / `--trusted-fixture` must only be used for checked-in first-party code. External trials must execute inside the existing resource-limited, network-disabled container profile. `TS_ANALYSIS_ISOLATED=1` is only a caller assertion made inside that container, never an authorization or host security boundary. Do not set it to run downloaded packages on the host.

The programmatic contract is `trial(moduleFile, exportName, {contract,bindings,inputs}, options)`. The CLI uses the same worker:

```sh
npm run cli -- seal experiments/sealing/module.js --export identity --plan work/plan.json --out work/trial.json --trusted-fixture
```

A number identity plan is `{"contract":{"variables":{"T":null},"parameters":[{"kind":"variable","name":"T"}],"result":{"kind":"variable","name":"T"}},"bindings":{"T":"number"},"inputs":[{"family":"number","value":17}]}`. Status/code are printed; JSON retains the complete classified evidence. Provider/protocol failures are not successful research evidence even when the CLI finishes writing their record.
