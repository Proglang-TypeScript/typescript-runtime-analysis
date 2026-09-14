# Revised to revised-2: implementation record

Date: 2026-09-14. Base: `a534fedf15b1df208ce54ce93b12fdce8e7c2bf9` on master of [Proglang-TypeScript/typescript-runtime-analysis](https://github.com/Proglang-TypeScript/typescript-runtime-analysis). The previous revised description matches its retained committed copy. Exact revision2 and its unified delta are retained in `docs/specifications`; older specifications, behavior, attribution and results remain intact.

## Delta mapping

| Requirement added/changed | Implementation/evidence |
|---|---|
| Mission: propose, actively validate and refine relational hypotheses | New `@tra/sealing` workspace, real proposing tuple collector, challenge/refinement controller, active experiment |
| Fresh negative seals, positive checks/unsealing | Strict TypeScript boundary kernel, per-trial/per-variable WeakMap brands, anti-forgery/cross-trial tests |
| Reverse callback/function polarity | Recursive function boundary monitor, actual direct callback experiment and returned-function kernel test |
| Separate six outcomes | Validated version1 trial schema, concrete controls, bounded worker and sticky fault ledger |
| Challenge with diverse inputs | Nine finite inputs across seven families; two different admissible constrained records |
| Justified constraint or overload refinement | Supported object-field counterexample plus complete proposing observations; constraint re-challenged; non-generic fallback explicitly unvalidated |
| Compare four configurations | Generated declarations/compiler diagnostics and `tables.csv` for unions, observation overloads, passive generic and active refinement |
| Preserve proposing/trial/counterexample/inconclusive/refinement evidence | `experiments/results/sealing` JSON records, raw sidecars, source hashes and `trials.csv` |
| Independent held-out valid/invalid clients | Distinct TypeScript clients; active valid passes API6/native7, active invalid rejects, passive false-generic acceptance exposed |
| Explicit primitive/proxy/native limitations | Conservative preflight/runtime trap classifications and `docs/sealing.md`; unsupported is inconclusive, never pass/fail |
| Updated research protocol | Active claim, four baselines, outcome/coverage metrics, frozen family/client splits and falsification controls |

## Findings and validation

Known identity passes nine fresh challenges; the observationally correlated constant fixture is rejected on nine correctly classified seal violations. The object-field generic is rejected, then its justified string-field constraint passes two fresh challenges. Direct callback transport passes; seven explicit observability/native cases are inconclusive. Ordinary exceptions, actual worker timeout and harness failures remain separate; caught faults never count as passes. The passive generalization accepts an independently invalid parametric client that active refinement rejects.

Completed local validation in both the working snapshot and canonical checkout: clean lockfile install; Node24.21.0 build; 110 preserved assertions plus nineteen existing and fourteen new regressions (143 total, zero failed); four smoke workflows; Track A, retained legacy pattern prediction, passive relational and active sealing experiments; independent TypeScript6/native7 checks. The canonical checkout's live full dependency audit reports zero advisories, including development dependencies. An initial strict-Ajv union-type schema compilation failure was corrected with supported anyOf branches; the complete final checks pass without relaxing schema strictness. Previously tracked experimental artifacts were restored after verification, preserving the earlier runs; only new sealing evidence is added.

Publication follows the successful local checks. The accompanying handoff validation record reports the actual final commit, exact-commit GitHub CI result, clean worktree, source hashes and local/remote synchronization. No remote CI success is asserted before that verification completes.

Only a workspace dependency is added; no external dependency version change is needed for this delta. Existing current compiler/runtime and security remediations are retained. No history rewrite, force push, unrelated repository update or visibility change is required.

## Limits and unresolved blockers

Active inference is unary identity-style and shallow string-field constraints, not full polymorphic inference. Container/discriminated/correlated candidates remain passive interfaces. Returned-function calls are kernel-tested but not fully exercised by worker client generation. Conservative source exclusions may reduce coverage; primitive boxing is not claimed transparent. Finite synthetic challenges establish infrastructure, not universal soundness or measured cross-package improvement. Overload fallback preserves known outputs but is not sealing proof. External code requires actual container isolation, not an environment flag.

Pre-existing unrelated blockers remain: pattern-repository upstream write permission; historical archived-corpus metadata export needs explicit approval; the preserved exact calculator golden differs in IDs/locations. Maintained supported build/test profiles pass without weakening that historical golden. Track A remains the engineering-readiness recommendation until Track B has a reviewed, family-split real-package pilot.
