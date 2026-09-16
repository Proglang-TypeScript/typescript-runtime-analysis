# Line A two-package development pilot

## Scope

This bounded development pilot uses `ms@2.1.3` (callable CommonJS root, Mocha source suite) and `qs@6.15.3` (CommonJS object export, Tape source suite). Exact npm integrity, source commits and hashes, derived-entry hashes, the pinned Node image and candidate reference hashes are in `experiments/line-a-pilot/manifest.json`. External code ran with no network, a read-only root, one CPU, 1 GB memory, a PID limit, dropped capabilities and the pinned `node:24-bookworm-slim` digest. No package lifecycle script ran.

The checked-in entries are deterministic call selections derived from README and test sources; they are **not full framework-suite executions**. Assertions were removed and package-name README imports were normalized to the relative package root. This preserves the evidence source distinction while avoiding unavailable development runners, but it is weaker than the planned full-suite pilot. Raw traces and package checkouts remain in ignored `work/`; the compact bundle retains generated declarations, diagnostics, trace counts and evaluation only.

The four arms retain the protocol's existing definitions: README-only, tests-only and union are unfiltered contamination baselines; filtered-union uses the audited public boundary. For object exports, unfiltered functions without verified paths are represented by source function names and flagged `UNFILTERED_INTERNAL_API_APPROXIMATION`.

## Provisional results

| Package | Configuration | Callable-path recall | Callable-path precision | Client checks |
|---|---|---:|---:|---:|
| ms | README-only | 1.00 | 0.20 | 3/4 |
| ms | tests-only | 1.00 | 0.20 | 3/4 |
| ms | union | 1.00 | 0.20 | 3/4 |
| ms | filtered-union | 1.00 | 1.00 | 4/4 |
| qs | README-only | 0.50 | 0.11 | 2/4 |
| qs | tests-only | 0.50 | 0.10 | 2/4 |
| qs | union | 0.50 | 0.09 | 2/4 |
| qs | filtered-union | 0.50 | 0.33 | 3/4 |

These are **provisional callable-path metrics**, not the preregistered signature metric. The candidates are current, version-family-matched DefinitelyTyped declarations at commit `455254aa7204192e7f7fbe50266d2313cefdf6c9`; independent pilot review is pending.

For `ms`, every arm recovers both observed root overload shapes. Unfiltered arms also expose four implementation helpers, causing their contamination client to typecheck; filtered-union removes those helpers and matches the candidate reference's single callable path. For `qs`, all arms recover `parse`, but `stringify` is withheld because legacy inference produces unsupported dependent object/interface structure. Filtering removes `compactQueue` contamination, but recursively reachable functions below the public `formats` object remain runtime-public and are absent from the candidate reference. Union evidence increases observations but does not improve callable-path recall in these selected entries.

## Pilot-driven repairs

The run justified three bounded infrastructure corrections:

1. Exact configured relative roots such as `./` and `../` are accepted without reopening bare-package matching.
2. Isolated runs now record configurable module request, evidence source, repository, commit and immutable image.
3. The unfiltered arm again emits an explicit contamination baseline; object-member inference failures now abstain per member instead of crashing the package run.

## Interpretation and next gate

This result supports the **mechanical usefulness** of public filtering on two development packages, but it does not support the study hypothesis. The sample is two related convenience libraries, the entries are selected rather than full suites, references are not yet independently adjudicated, and path identity ignores signature details. The immediate gate is the review guide in `docs/line-a-pilot-review-guide.md`. After two reviewers resolve the `formats` and overload questions, run full Mocha/Tape suites from frozen development dependencies, replace path scoring with reviewed signature scoring, and add eight packages only if the repaired runner remains bounded and the `qs.stringify` abstention policy is acceptable.

Reproduce the compact evaluation after preparing the ignored traces and DefinitelyTyped checkout:

```sh
node scripts/line-a-pilot-evaluate.cjs work/line-a-pilot-runs work/definitelytyped experiments/line-a-pilot work/line-a-pilot-runs/evaluation.json
```
