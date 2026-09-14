# Research protocols and publication plan

## Recommendation: Track A first

The recovered tracing, inference and comparison pipeline already executes README and package-test fixtures. Track A can therefore study evidence combination without first recovering an unknown dynamic-pattern thesis backend. Track B now has a genuine static/runtime join and frequency predictor, but only a deliberately shallow new abstraction and synthetic observations. This recommendation reflects engineering readiness, not empirical superiority.

The synthetic run demonstrates that union evidence preserves both sources and that filtering removes a test helper. It establishes no improvement in declaration quality. The synthetic predictor intentionally encounters held-out string addition and unsupported multiplication patterns; wrong answers and abstentions remain visible in raw results.

## Track A protocol

**Claim to investigate:** package tests complement README examples for recovering public CommonJS API declarations, with explicit export filtering limiting internal API contamination.

**Primary hypothesis:** filtered union improves per-package public signature recall over README-only at no more than a preregistered five percentage-point reduction in precision. This threshold is proposed for the protocol and must be fixed using development data before final evaluation.

**Primary metric:** macro-averaged public signature recall against version-matched, independently reviewed reference declarations. Report precision, F1, valid-client pass rate, unsupported constructs, evidence conflicts, public API contamination, time and peak memory as secondary metrics. A reference declaration is evidence, not proof of runtime soundness.

**Baselines/ablations:** README-only, tests-only, unfiltered union, filtered union; recovered legacy interaction inference held fixed across configurations; a supported static declaration-generation baseline; optionally an introspection baseline. Separate public filtering, shallow-type evidence and interaction heuristics in ablations only after baseline reproduction.

**Dataset:** freeze npm versions, tarball integrity, source repository commit, README/test hashes, dependency lock, reference-declaration commit and runtime image digest. Split development/validation/evaluation by package family and shared source lineage; assign closely coupled forks/generated wrappers to the same group. Record shared dependencies and exclude their observations from target evidence. Choose validation thresholds once; never tune on evaluation data. Use stratified sampling by module shape and test framework, with the seed and sampling script retained.

**Exclusions:** preregister ESM-only modules, native bindings, network-only tests, services and unsupported backend semantics for the initial CommonJS claim. Report all exclusions and execution failures, with both eligible-package and all-selected-package denominators. Browser packages and API-key requirements are failures/exclusions, not silent removals. Manually annotate a random subset using two reviewers; record disagreement resolution.

**Statistical analysis:** paired package-level differences, bootstrap confidence intervals clustered by family, and a paired permutation test for the primary comparison. Report effect sizes and precision/recall tradeoffs; adjust secondary comparisons using Holm's procedure. Estimate sample size from a development pilot rather than inventing a power claim from synthetic fixtures. Runtime observations are not independent statistical samples.

## Track B protocol

**Claim to investigate:** deterministic source patterns predict shallow JavaScript operand types across independent package families, with calibrated abstention.

**Primary hypothesis:** a package-balanced conditional frequency baseline improves macro package-level accuracy over the global-type majority baseline at a fixed preregistered coverage level.

**Primary metric:** macro package accuracy at 70% coverage if validation demonstrates this level is feasible. Otherwise select and freeze a feasible coverage target before evaluation. Report coverage, macro-F1, log loss/Brier score for probabilistic output, support distributions, unseen-pattern rate and per-position confusion matrices.

**Baselines/ablations:** global majority, operator-only frequencies, binary-shallow-v1 frequencies; separately vary literal retention, depth, commutativity and location matching only after preserving abstraction versions. Compare package-balanced and raw-event frequencies. No ML framework is needed for the initial baseline.

**Dataset/splits:** freeze the same identities and artifacts as Track A. Group package families, source clones and shared implementation dependencies before train/validation/test assignment. The predictor currently rejects overlapping package names, but family/clone grouping remains a dataset-curation requirement. Type labels come from independent recorded runtime operands, not predictions; retain location-match failures and unsupported operators. Tune support/confidence only on validation, with seed and chosen thresholds recorded.

**Exclusions:** invalid source maps, unsupported syntax/semantics, missing runtime coverage and ambiguous joins receive explicit reasons. Do not infer zero frequency from missing execution. Report static pattern occurrence counts, dynamic counts and package-level counts separately.

**Statistical analysis:** family-cluster bootstrap confidence intervals, paired package-level permutation tests against the global/operator baselines, held-out calibration curves and support/coverage sensitivity. Keep related code families out of evaluation and examine domain shift. Synthetic fixture metrics are infrastructure checks only.

## First two weeks for Track A

Week 1: establish reproducibility from the consolidated lockfile; review CommonJS export identity including object exports and constructors; curate ten fixed-version development packages across two test frameworks; prepare offline dependencies and version-matched references; record all backend exclusions. Deliver source/provenance manifests, container runs and failure examples.

Week 2: run the four evidence configurations on those packages; manually review signatures and contamination; implement only export-filter corrections justified by regressions; generate package-level quality/time tables and a feasibility memo. Freeze the experimental scope, primary metric and pilot-informed sampling plan. Decide whether the five-month claim is viable before expanding the corpus.

## Submission plan

Target a submission-ready manuscript by approximately **2027-02-14**, five months after recovery began. Venue types: runtime/programming-language empirical research (MPLR), testing/analysis research (ISSTA), or object-oriented/language/tooling research (ECOOP); a journal is a schedule-independent alternative if conference deadlines conflict.

The [ISSTA2027 dates page](https://conf.researchr.org/dates/issta-2027) lists a full-paper deadline on **2027-01-11** as checked 2026-09-14. That is earlier than the five-month endpoint, so treat it as an accelerated option only if the pilot and corpus are ready. Recheck its CFP, scope, abstract deadline, timezone, page limits and artifact rules before choosing it. No ECOOP2027 or MPLR2027 deadline was verified here; verify their official CFPs in week 2 and again before submission. Do not reuse prior-year deadlines.

| Week | Deliverable / gate |
|---|---|
| 1 | Verified toolchain, export-boundary audit, ten-package development manifest |
| 2 | Four-configuration pilot, feasibility and venue decision |
| 3 | Reference annotation rubric, reviewer agreement pilot |
| 4 | Package-family/clone/dependency grouping and immutable splits |
| 5 | Preregister primary hypothesis, exclusions, metrics and statistics |
| 6 | Reproduce static and legacy baselines; draft method section |
| 7 | Development-only export/diagnostic refinements with regression tests |
| 8 | Lock algorithm and thresholds; validate independent clean artifact run |
| 9 | Run first half of held-out corpus with raw observations retained |
| 10 | Complete held-out corpus; audit exclusions/failures without tuning |
| 11 | Blinded manual reference review and disagreement resolution |
| 12 | Generate primary tables, paired effects and confidence intervals |
| 13 | Run preregistered ablations; draft results and threats |
| 14 | Related-work review, claim boundary, dataset/source audit |
| 15 | Full paper draft and artifact README; independent reviewer run |
| 16 | Revise statistics and presentation; decide accelerated ISSTA feasibility |
| 17 | Address reviewer feedback and reproducibility defects without retuning |
| 18 | Freeze result manifest, rebuild tables, polish abstract/introduction |
| 19 | Anonymous artifact, licenses, exclusions and package-integrity verification |
| 20 | Submission-ready manuscript, final CFP check, archive artifact locally |
| 21–22 | Buffer for submission formatting, external review or journal adaptation |

Artifact contents: source and exact upstream provenance; dependency lock and runtime image digests; versioned schemas; immutable package/family/split manifests and tarball integrity; README/test/reference source hashes; limited-container commands; raw observations and diagnostics; predictions; exclusions, failures and annotation decisions; seed/threshold metadata; table/statistics scripts; clean build/test instructions and manuscript figure/table derivations. Keep host paths and credentials out of any published artifact. Publication and remote repository creation require separate authorization.
