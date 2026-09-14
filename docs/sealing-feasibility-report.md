# Early sealing feasibility: phase-2 infrastructure

Status: infrastructure preparation, not a completed week-three feasibility study. Base repository commit: `9ea34565dfd95f8f62f79a4d9f262c62a86b4a84`. The supplied outline is retained verbatim under `docs/specifications`. Existing owner work, imported licenses and earlier experimental artifacts remain preserved.

## What is ready

- Exactly pinned public DefinitelyTyped input; separate sparse development smoke and full-snapshot commands; no package installation/execution.
- Compiler-API export extraction, bounded polarity/classification, canonical declaration/export/package deduplication, explicit unknown/unsupported/diagnostic outcomes.
- Per-package resource-limited workers, provenance/implementation hashes, resumable validated shards, streaming machine-readable rows and generated tables.
- Deterministic stratified manual-review queue and assessment validation, preserving false/ambiguous classifications and user review files.
- Opt-in exact npm-version/integrity metadata catalogue, without host credentials; obtainable metadata and verified runtime executability are distinct.
- Review-attested runtime-evidence intake binds actual lock/recipe/execution artifacts to catalogue versions and census exports; unknown, unsupported and failed attempts stay separate, and no executable status is inferred automatically.
- Retained phase1 fixture workflow: actual proposing tuples, fresh seals, known identity transport, coincidental constant-provider violation, supported callback polarity, classified unsupported/ordinary/timeout/harness outcomes and independent client checks.

The phase2 command sequence and unit conventions are documented in [generic-api-census.md](generic-api-census.md). [sealing.md](sealing.md) describes current runtime semantics and limitations. Census position analysis covers more candidate forms than the present runtime kernel; a census tag is not a claim that sealing implements it.

Retained DefinitelyTyped declaration excerpts carry source locations/pin, manifest owner/project attribution and `LICENSES/DefinitelyTyped.txt`. Census tooling is new owner-controlled glue under the existing pending-license decision; no historical source license/notices are replaced.

## Evidence and remaining study work

The six-package pinned smoke is retained separately under `experiments/results/census-smoke`. Its machine summary records selection/full-corpus coverage, declaration/export counts and compiler diagnostics. It validates infrastructure only. Manual review is pending; no zero false-classification rate is asserted. Exact runtime metadata is retained under the smoke availability directory for the explicitly queried development selection; no package was installed or exercised.

Observed development smoke: 3,366 unique callable declarations, 2,879 with scoped formal type parameters (1,572 with own parameters), and 580 with known negative/positive occurrences, across six nominal packages. These are provisional counts under the documented policy, not executable or independently reviewed benchmark counts. There were no extraction failures; React retains unresolved external csstype diagnostics across its entry checks. Sixteen stratified review items remain pending. Runtime metadata is obtainable for d3-array3.2.4 and lodash4.17.23 on the matching declaration lines, not automatically upgraded to unrelated latest lines; zero exports are runtime-verified.

Do not claim the 100 executable functions / 25 independent-packages gate is met. Verified-executable exports remain zero/unassessed, not evidence of absence. A full census, stratified independent review, complete replay recipes, container-based package pilot and required broader discriminating fixtures remain study work. Source/package-family independence must be curated before freezing a benchmark.

The outline's later five-outcome taxonomy includes semantic mismatch and maps ordinary unrelated failures to inconclusive. The existing revision2 runtime stores six detailed statuses (passed, seal-violation, exception, timeout, inconclusive, harness-failure); no phase2 change silently reinterprets them. Phase3 must document a versioned mapping/semantic-mismatch extension before the full feasibility experiment, preserving detailed causes and non-counted failures. Existing traces retain bounded synchronous tuples, not complete arbitrary receiver/alias/async/setup/teardown replay for every package.

## Week-three decision and next milestone

No new evidence-based week-three go/no-go decision is made by preparing infrastructure. Line A remains the previous engineering-readiness recommendation; Line B is exploratory pending the outline's mandatory gates. Do not lower the 100/25 gate or treat syntactic counts/finite fixture passes as soundness. If a mandatory gate actually fails by week three, recommend Line A and preserve all sealing results.

Next two weeks: first run/review the full phase2 census with frozen unit/unknown policies and pin, curate a small development-only runtime shortlist, and resolve declaration/runtime version mismatches. Then specify the supported operation/taxonomy/replay fragment and execute manually inspected, isolated real-package trials with exact inputs/setup/dependencies. Freeze semantics, coverage thresholds, package-family splits and baseline protocol before any held-out evaluation. Keep final evaluation data untouched during these refinements.

Publication is authorized by the subsequent explicit request to commit this preparation on a new branch and push it. The change scope is the census workspace/scripts/tests/input pin, feasibility/census documentation and new development smoke evidence; older tracked results are unchanged. Publication and remote CI verification are recorded separately from study results.

## Subsequent corpus follow-up

The compact 8,680-package full-corpus baseline was published separately as `2aa7db8`, with remote CI passing. Failure remediation, diagnostic assessment, 40 explicitly single-agent source reviews and five actual ordinary pilot executions across three nominal packages are recorded in [the follow-up report](census-followup.md). The follow-up recovered 19 of 21 failures in a fresh subset run; the repaired full census, two remaining failure cases, independent human/family validation and active sealing remain pending. Initial smoke validation below is historical and is not a claim that these new study gates are satisfied.

## Completed initial infrastructure validation

Canonical-checkout clean install, build and complete check succeeded on Node24.21.0/npm12.0.2: 110 preserved assertions +33 prior regressions +18 census tests =161 passed, zero failed; four smoke workflows and all retained sealing/relational/Track A/pattern experiments pass their stated assertions. Live full dependency audit reports zero advisories, including development dependencies. The lockfile only adds an internal workspace link/dependency record; existing external versions are unchanged.

Pinned six-package extraction, identical-configuration resume, shard aggregation, empty review intake and empty runtime assessment all succeeded. The catalogue validates both exact object and npm12 single-record-array protocols. Five diagnostic-free development packages and React's missing external declaration dependency remain distinct. Empty runtime assessment reports 5,236 exports not assessed, zero reviewed-executable exports; the sixteen manual reviews are pending. This validates preparation, not a completed corpus study. Prior tracked experimental outputs were restored after checks; only new census evidence is retained. These preparation checks precede publication and do not by themselves establish remote CI success.
