# Revised project-description delta

Date: 2026-09-14. Target: [Proglang-TypeScript/typescript-runtime-analysis](https://github.com/Proglang-TypeScript/typescript-runtime-analysis), private, existing master branch. Starting HEAD: bab85848ba4020cbb9fd8a09c4845440658e8d36; clean checkout and zero upstream divergence before work.

## Exact comparison

The revised description changes exactly two regions: mission item2 and the Phase7 Track B subsection. Track B changes from cross-package code-pattern/type prediction to invocation-level relational signatures. Track A, all recovery/security/isolation requirements, and Workflow D static/dynamic pattern recovery are unchanged. Both descriptions and the exact unified diff are retained in docs/specifications. The source revised file was found in /Users/thiemann/Downloads/codex-project-work-description-revised.md.

## Implemented delta

| Revised requirement | Implementation / evidence |
|---|---|
| Retain argument, receiver, result, callback and outcome as an invocation tuple | Optional entry/exit collector; validated version1 .invocations.json sidecar; stable per-run identities and source maps; callback/parent links and thrown outcomes remain explicit |
| Express signature-position equality/container elements | Strict TypeScript relational-signatures workspace; per-tuple value equality and complete non-empty container membership; supporting invocation IDs and relationship paths |
| Bounded generics, discriminated overloads and correlated unions | Identity-style generic, element generic, up to8 shallow string-discriminant branches and explicit correlated invocation type; bounded observation/candidate budgets |
| Compare with both specified baselines | Component-wise unions and literal/shallow overload-per-distinct-observation; all declarations and failures retained |
| Explain support and abstain | Candidate reasons, supporting IDs, relationships; missing/diversity-free support, callbacks/throws, inconsistent arity, incomplete containers and budget overflow have visible diagnostics |
| Inference clients and separate held-out clients | Actual separate first-party JS executions; synthesis consumes inference tuples only; independent positive/negative TS clients checked by API6 and held-out native7 |
| Identity generics and shallow discriminated overloads end to end | CLI trace --invocations and synthesize; npm run experiment:relational; automated tests and root npm run check/CI |
| Publication-ready scaffold and protocol | Revised Track B hypothesis, metrics, baselines/ablations, family/client splits, exclusions, statistics and two-week pilot; raw runs, input hashes, candidates, diagnostics, evaluation and generated CSV tables |

No source repository history, original generator/comparator assertion, Track A implementation, or pattern workflow was discarded. Legacy pattern output is explicitly labeled legacy-pattern rather than Track B. No new external dependency versions were needed; the new local workspace declares the existing schema and TypeScript6 dependencies.

## Executed validation

- Native Node24.21.0/npm12: locked clean install, strict build and full check passed. Original110 assertions plus8 existing and11 new regression tests: **129 tests**. Four original smoke workflows, Track A, retained pattern scaffold, and new relational scaffold pass.
- Relational fixture: identity and element generics plus discriminated overloads;11 inference invocations and5 held-out invocations, with held-out evidence never consumed by synthesis. The relational inference/held-out clients pass; component-union clients have6/9 errors and observation-overload clients have0/5 errors respectively. Failures are retained, not suppressed.
- The negative client is rejected. Real callback and throw tuples, deduplication, conflicting/provenance identities, source positions, budget/insufficient-evidence abstention and incomplete containers are regression-tested.
- A final checkout-level locked install, complete check, full audit and exact-commit GitHub CI are recorded in the accompanying revision-validation.json/publication-verification.json at handoff.

## Explicit boundaries

This is one synthetic package family, not evidence of cross-package research improvement or universally sound generics. Synchronous callbacks/throws are preserved but their polymorphic/outcome inference abstains. Conditional/mapped types, full receiver/constructor/async/ESM inference, getters/proxies, empty-container generalization and real-corpus labeling remain outside the requested initial scaffold. Correlated invocation unions retain paired rows, but their projected function result loses dependent call-site precision; discriminated overloads are selected for the fixture. Prior pattern-upstream permission, archived-audit approval and historical golden-profile limits are unchanged and documented in the security/publication record.

## Reproduce

Use supported Node24, then npm ci && npm run check. Run npm run experiment:relational for just revised Track B. Its raw runs, declarations, candidates, client diagnostics, hashes and generated tables are under experiments/results/relational. Table derivation is scripts/relational-experiment.cjs aggregate; no manual transcription is used.
