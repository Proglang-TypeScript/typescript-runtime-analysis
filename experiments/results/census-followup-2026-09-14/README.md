# Census follow-up evidence

The original compact baseline was pushed first as [2aa7db8](https://github.com/Proglang-TypeScript/typescript-runtime-analysis/commit/2aa7db845931b6fb09e798b4f0d5c6fa062c7cdc); [CI passed](https://github.com/Proglang-TypeScript/typescript-runtime-analysis/actions/runs/34876754823). Baseline data/checksums remain frozen. This folder contains separate follow-up evidence, not raw declaration trees, a full repaired census, or a resumable checkpoint.

## Results

1. Namespace-cycle and file-transport repairs recovered **19 of 21** failed/missing baseline packages in a fresh subset run. Go still exceeds the explicit 256 MB file-output guard; the beyonk cookie-banner manifest still references an absent ESM declaration. See `failure-triage.json` and the supplemental provenance/summary/hash index.
2. Assessed all retained compiler diagnostics and all **272** first-order representatives: **232** diagnostic-free under census configuration, **16** with candidate-file diagnostics, **24** with context-only retained diagnostics. Missing `undici-types` and `csstype` dominate unresolved external dependencies. Diagnostics remain capped, and absence of a sampled match is not completeness.
3. Inspected all **40** classification sample sources/context: **31 agree, four false classifications, five ambiguous**. Reviews are explicitly single-agent/AI-assisted; independent human review remains pending. Nested callback-array transport tags were repaired, with all four concrete regressions re-extracted and confirmed.
4. Froze and audited three exact-version development packages, then actually exercised **five** exports in the existing network-disabled limited container runner. All returned successfully, versions/integrities matched, all three audits report zero known vulnerabilities, and source inventories were unchanged. Finite ordinary assertions are not active sealing, universal correctness or human-independent validation.

Runtime intake reports five reviewed-loaded-and-exercised records and 894,009 unassessed exports of the original census. Nominal package origins are not a certified independent-family count. `prelude-ls.head([])` returned undefined despite its `A` declaration result; the selected pilot recipe requires nonempty arrays. Pilot data is development-only, never held out.

## Files and integrity

- `failure-triage.json`, `supplemental-run.json`, `supplemental-summary.json`, `supplemental-shards.sha256`: baseline causes, repaired subset outcomes and raw evidence fingerprints. Raw subset shards remain outside Git.
- `diagnostic-assessment.json`: compiler-code/unresolved-dependency priorities and candidate-level diagnostic status; counts overlap and refer to retained samples.
- `reviews.json`, `review-assessment.json`, `classification-regressions.json`: source-hashed agent-attributed reviews, validated counts and concrete repaired classes. The baseline review queue itself stays unchanged.
- `pilot-catalog.json`, `pilot-selection.json`, `runtime-assessments.json`, `runtime-assessment.json`: exact mappings, reviewed development recipes and validated ordinary-execution counts.
- `pilot-evidence/`: exact package locks, install/audit receipts, invocation recipes, actual execution receipts and wrapper trace envelopes/execution metadata. No installed npm trees or raw inline-source traces are included.
- `pilot-*.cjs`: reusable explicit invocation recipes. See the infrastructure guide for reviewed installation and isolated execution requirements; never execute external packages as trusted fixtures.
- `tool-source-hashes.json`, `followup-manifest.json`, `SHA256SUMS`: implementation/base publication references, validation and bundle checksums. Source hashes identify working software changes; no follow-up code commit/publication is implied.
- `DefinitelyTyped-LICENSE.txt`: existing attribution/license, with pinned source URLs in reviews.

Verify from this directory with `shasum -a 256 -c SHA256SUMS`. Evidence paths in runtime assessments are relative to this folder and their SHA256 hashes must match. Supplemental raw hash paths are relative to the original supplemental run directory, not this folder. Ordinary execution receipts include actual runner commands, image, source inventory and successful assertion markers; an independent reviewer must still inspect them.

## Next actions and full-rerun commands

Use the final repaired software, Node24 and the existing clean pinned snapshot, with a **fresh** output directory:

```sh
npm run census -- --snapshot work/definitelytyped --out work/census-reviewed-full --time-limit-hours 1
npm run census -- --snapshot work/definitelytyped --out work/census-reviewed-full --time-limit-hours 1 --resume
```

Do not combine differing census identities into an asserted repaired full census or add imported/declaration-deduplicated subset counts directly to baseline totals. No full repaired global run was performed here. Independent reviewers, external declaration overlay/version policy, Go representation/resource profile, missing ESM entry handling, broader pilots/active sealing, family independence and untouched held-out curation remain pending. The study's 100-function/25-independent-package gate is not established.

Maintained software validation: 110 Jest assertions + 58 Node tests = **168 passed**, no failures. The compact baseline's remote CI pass is separate from these follow-up local checks. Evidence was captured before follow-up publication; historical commit/push flags describe that capture state, not the current branch. Publication is authorized by the subsequent explicit commit/push request; exact-commit publication/CI verification is recorded separately. Full source trees, installed dependencies and raw census tables remain ignored in `work/`.
