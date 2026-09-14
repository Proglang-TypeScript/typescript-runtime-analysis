# Census baseline follow-up: failures, diagnostics, review and pilots

**Subsequent work:** the Go storage blocker and explicit partial-entry reporting are implemented, and a fresh 8,680-package full rerun is complete. See [the repaired census and human-review report](census-repaired-followup.md). The findings below remain the historical baseline/failure-subset evidence, not the current global run.

The compact full-corpus baseline was committed and pushed first as [2aa7db8](https://github.com/Proglang-TypeScript/typescript-runtime-analysis/commit/2aa7db845931b6fb09e798b4f0d5c6fa062c7cdc) on `phase-2-census-infrastructure`; its [validation workflow passed](https://github.com/Proglang-TypeScript/typescript-runtime-analysis/actions/runs/34876754823). Its data and checksums remain unchanged. Publication of these separate follow-up implementation/evidence changes is authorized by the subsequent explicit commit/push request. The evidence manifests describe their original prepublication capture state; publication and exact-commit remote CI verification are recorded separately.

Follow-up evidence is under `experiments/results/census-followup-2026-09-14`. The baseline census identity is `8235039d24e334ab26863f6a87cb8f828ff91f75dbfbe01bcf9d2a9cd4f7dcf0`; the final failed-package supplemental run identity is `801ea8c72bb329317b4ac446555936bb5c13973ecef0edb4d45433ee544c2a5e`. Different identities must not be merged into an asserted repaired full-corpus census.

## 1. Failure triage and repairs

The 21 baseline failures comprised 17 recursive namespace traversals, three stdout-buffer overflows and one missing declared entry variant. Namespace walks now track ancestor symbols per path, cut recursive aliases with explicit exclusions, and preserve independent sibling aliases. Deduplication also keys by module specifier, preventing collisions between same-named exports of different ambient modules.

Worker results now use temporary-file transport instead of the original 64 MB stdout buffer. Output has an explicit 256 MB serialized-file limit, separate 1 MB diagnostic log cap, unchanged 1 GB heap and two-minute deadline. Temporary worker files are removed; canonical shards are still atomically written. No guard has been silently removed.

All 21 packages were rerun into a fresh supplemental output with the final software. **19 now extract**, of which 12 retain compiler diagnostics. Two remain explicit:

- `go`: serialized worker output exceeds the explicit 256 MB resource limit. It needs reviewed compact representation/streaming or a deliberate higher-resource profile, not unbounded memory/output.
- `beyonk__gdpr-cookie-consent-banner`: the pinned manifest declares `./esm/index.d.ts`, which is absent even though primary `index.d.ts` exists. This is partial declared-entry coverage; no replacement source file was fabricated or variant silently discarded.

The supplemental command exits nonzero because those two cases remain. It is a 21-package development remediation run, not a new full census. Its distinct counts include imported declarations and cannot simply be added to baseline totals.

## 2. Diagnostic coverage assessment

The baseline has 3,738 compiler-diagnostic packages. Retained diagnostics cover 39 compiler codes. Missing modules (TS2307) occur in 3,117 packages; the largest unresolved external declaration dependencies are `undici-types` (1,965 packages) and `csstype` (648). Missing type references and API/configuration incompatibilities remain separate categories. These counts overlap and use capped retained samples, not all uncapped diagnostics.

Among the 272 baseline first-order declaration representatives, 232 come from compiler-diagnostic-free package extractions under the census configuration; 16 have retained diagnostics in the candidate source file; 24 have context diagnostics without a retained source-file match. Absence of a retained match is not semantic completeness, especially when samples are capped. The evidence records the candidate-specific status and source locations.

No external type dependencies were silently installed into the pinned input. A complete dependency-aware census will require a reviewed, independently pinned declaration overlay/resolution policy, with new provenance and a fresh run. This assessment prioritizes issues and keeps diagnostic-free pilot candidates distinct; it does not declare all remaining diagnostics fixed.

## 3. Classification review and regression fixes

All 40 baseline stratified sample items received source/declaration/enclosing-scope inspection, with source hashes, pinned URLs and notes in `reviews.json`. The reviewer is explicitly **a single AI-assisted agent, not independent human validation**. Results: 31 agree with the bounded classification, four false classifications and five ambiguous cases. Independent human review and agreement remain pending. A stratified sample this small is not a corpus-wide error-rate estimate.

Four false transport tags came from array occurrences underneath callback/function boundaries: Angular injector invocation, two WinJS reducers and jQuery callback queues. Such nested occurrences no longer supply outer `container-element`/`value-to-container` tags. Regression tests preserve higher-order classification; fresh extraction of all four concrete declarations confirms the misleading tags are absent. Rest-argument container interpretations and unverified long constructor/namespace runtime paths remain explicit ambiguities rather than fabricated agreement.

Agreement concerns the documented positional/occurrence rule, not pure identity, arbitrary runtime instantiation or parametricity. Union projections, constraints, side effects, type-only members and inherited/imported declarations require further source/client/runtime assessment.

## 4. Frozen runtime pilot and actual ordinary execution

Three development package mappings were frozen from anonymous public npm metadata: `underscore@1.13.8`, `prelude-ls@1.1.2`, `transducers-js@0.4.174`. Their major/minor lines match the declarations; exact versions, tarball integrities and repository/source commits are retained. Versions follow declaration-line compatibility rather than silently upgrading to a different latest line.

Dependencies were installed in limited credential-free containers with lifecycle scripts disabled. All three exact locks match catalogue integrity, and all three dependency audits report zero known vulnerabilities. No package lifecycle scripts or downloaded runtime code were intentionally executed during network-enabled preparation.

Actual ordinary calls then ran through the existing network-disabled, read-only, unprivileged container runner on the recorded immutable Node image, with Node24.21.0. The five exercised exports are:

- `underscore.identity`: object/array reference preservation, number and null cases.
- `prelude-ls.id`: object-reference and number cases.
- `prelude-ls.head`: nonempty object/number arrays.
- `prelude-ls.reverse`: preserved object-element references and an empty array.
- `transducers-js.identity`: object-reference, number and null cases.

Every execution returned successfully with explicit assertions and unchanged source/dependency inventories. An additional boundary observation found `prelude-ls.head([])` returns `undefined` although its declaration says `A`; the selected ordinary recipe has a nonempty precondition, and the unconstrained declaration is not universally validated.

Runtime evidence intake validated five positive export records against the original census/catalogue and lock/recipe/execution hashes, leaving **894,009 exports not assessed**. These are actual finite ordinary calls plus a single-agent source/receipt review, not active sealing or independent human certification. Runtime dependencies in `node_modules` execute uninstrumented; trace provenance identifies the first-party client wrapper, while exact locks, source inventories and assertions identify the external callees. Do not reinterpret those traces as complete callee-internal observations.

The three nominal repository origins differ, but detailed copying/ancestry/family independence is not certified. These packages are development data (underscore already appeared in smoke), never untouched held-out evaluation. The 100 executable functions / 25 independent packages study gate remains unmet/pending, not inferred from three npm names.

## Checks and remaining work

The final maintained software passes **168 tests**: 110 preserved Jest assertions, 33 prior Node regressions and 25 census tests. New checks cover recursive alias cycles with independent aliases, ambient-module key collisions, file-backed worker success/failure cleanup and nested callback-array classification. All earlier assertions remain enabled. Baseline hashes are retained; runtime receipt hashes/locks, three audits, source immutability and actual invocation markers were checked. No destructive checkout changes were made.

To obtain comparable repaired global counts, run the final software against the existing clean pinned snapshot in a fresh directory:

```sh
npm run census -- --snapshot work/definitelytyped --out work/census-reviewed-full --time-limit-hours 1
npm run census -- --snapshot work/definitelytyped --out work/census-reviewed-full --time-limit-hours 1 --resume
```

Do not resume the baseline with changed software. The full repaired census was not run during this follow-up; only the failure subset and concrete classification regressions were re-extracted. Remaining work is the oversized Go shard/profile, absent declared entry decision, pinned external declaration coverage, independent human reviews, expanded pilot recipes/active sealing, source-family checks and held-out curation. Preserve the earlier Line A readiness recommendation until the mandatory study gates are genuinely evaluated.
