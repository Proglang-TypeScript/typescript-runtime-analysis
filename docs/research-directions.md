# Research protocols and publication plan

## Recommendation: Track A first

The recovered tracing, inference and comparison pipeline already executes README and package-test fixtures. Track A can therefore study evidence combination using preserved declaration inference. Revised Track B now captures real invocation tuples and runs bounded relational signature candidates and independent typing clients, but has only one synthetic package family and no validated real-package corpus. This recommendation reflects engineering readiness, not empirical superiority.

The synthetic run demonstrates that union evidence preserves both sources and that filtering removes a test helper. It establishes no improvement in declaration quality. The retained legacy pattern predictor still reports wrong answers and abstentions. Revised Track B demonstrates identity/container generics and discriminated overloads, while preserving baseline client failures; neither scaffold establishes a publication-quality improvement.

## Track A protocol

**Claim to investigate:** package tests complement README examples for recovering public CommonJS API declarations, with explicit export filtering limiting internal API contamination.

**Primary hypothesis:** filtered union improves per-package public signature recall over README-only at no more than a preregistered five percentage-point reduction in precision. This threshold is proposed for the protocol and must be fixed using development data before final evaluation.

**Primary metric:** macro-averaged public signature recall against version-matched, independently reviewed reference declarations. Report precision, F1, valid-client pass rate, unsupported constructs, evidence conflicts, public API contamination, time and peak memory as secondary metrics. A reference declaration is evidence, not proof of runtime soundness.

**Baselines/ablations:** README-only, tests-only, unfiltered union, filtered union; recovered legacy interaction inference held fixed across configurations; a supported static declaration-generation baseline; optionally an introspection baseline. Separate public filtering, shallow-type evidence and interaction heuristics in ablations only after baseline reproduction.

**Dataset:** freeze npm versions, tarball integrity, source repository commit, README/test hashes, dependency lock, reference-declaration commit and runtime image digest. Split development/validation/evaluation by package family and shared source lineage; assign closely coupled forks/generated wrappers to the same group. Record shared dependencies and exclude their observations from target evidence. Choose validation thresholds once; never tune on evaluation data. Use stratified sampling by module shape and test framework, with the seed and sampling script retained.

**Exclusions:** preregister ESM-only modules, native bindings, network-only tests, services and unsupported backend semantics for the initial CommonJS claim. Report all exclusions and execution failures, with both eligible-package and all-selected-package denominators. Browser packages and API-key requirements are failures/exclusions, not silent removals. Manually annotate a random subset using two reviewers; record disagreement resolution.

**Statistical analysis:** paired package-level differences, bootstrap confidence intervals clustered by family, and a paired permutation test for the primary comparison. Report effect sizes and precision/recall tradeoffs; adjust secondary comparisons using Holm's procedure. Estimate sample size from a development pilot rather than inventing a power claim from synthetic fixtures. Runtime observations are not independent statistical samples.

## Track B protocol: relational signature synthesis

**Claim to investigate:** invocation-level relationships preserve public argument/result associations that independent component-wise unions discard, allowing bounded evidence-backed identity generics and shallow discriminated overloads.

**Primary hypothesis:** on eligible APIs, relational candidates improve macro package-family held-out client acceptance with required result precision over component-wise unions, without increasing independently labeled invalid-call acceptance. Finite observations support a hypothesis, never a proof of universal runtime soundness.

**Primary metric:** macro family rate of separately frozen held-out valid clients that type-check with their required result types. Report invalid-call rejection, inference-client compatibility, candidate/declaration validity, abstention/coverage, callback/throw exclusions, signature size, time and memory. Report both all-selected and eligible-API denominators; successful observed invocations alone are not a soundness metric.

**Baselines/ablations:** component-wise argument/result unions and overload-per-observation; optionally version-matched handwritten declarations. Compare equality-only, container-element-disabled, discriminant-disabled and complete relational configurations after preserving format versions. No ML framework, conditional/mapped types or arbitrary polymorphic inference is needed.

**Dataset/splits:** freeze package/version, family/source lineage, commit, tarball integrity, dependency lock, image, source hashes and client hashes. Curate package-family development/validation/evaluation splits before algorithm tuning. Within each eligible API, separate inference invocations/clients from held-out runtime inputs and typing clients. Store every argument, receiver, result, synchronous callback link and return/throw outcome in one tuple. Never regroup independent parameter/result marginals into fabricated calls. Freeze candidate budgets and minimum support using development/validation families only. Label independent client validity with two reviewers and retain disagreements.

**Bounded scope:** initial implementations cover unary value-equality generics, non-empty shallow container-element generics, up to eight string-literal-discriminated branches, and explicit correlated invocation unions. Correlated-union function return projection loses input-dependent output precision and is reported as such; overloads are selected for the demonstrated branches. Callbacks and exceptional tuples are retained but full callback polymorphism and outcome-dependent synthesis abstain. Unsupported arity, insufficient/diversity-free evidence and budget overflow produce explicit diagnostics, not truncated-evidence success.

**Exclusions:** ESM/async semantics, native/built-in callbacks without instrumented entry, constructors/complex receiver inference, getters/proxies, empty-container generalization, missing source locations, incomplete containers, and conditional/mapped types are recorded limitations. Do not silently infer arbitrary universal relationships from coincidental value equality. Adversarial held-out examples should falsify such candidates; store counterexamples without tuning on final evaluation.

**Statistical analysis:** paired package-family differences with family-cluster bootstrap confidence intervals and a paired permutation test against each baseline. Report effect sizes plus valid/invalid-call and abstention tradeoffs; adjust secondary comparisons with Holm's procedure. Determine sample size from a development pilot. Invocations within an API are not independent statistical samples.

**Current artifact:** `npm run experiment:relational` executes checked-in inference and genuinely separate held-out JavaScript clients, uses inference tuples only for synthesis, checks separate TypeScript clients with API6 and native7, retains baseline failures/abstentions/raw tuples/candidates/metadata, and regenerates CSV tables. It is a single-family synthetic infrastructure check, not cross-package publication evidence. Legacy pattern prediction remains available as a recovery/reference workflow and is no longer Track B.

## First two weeks if Track B is selected

Week 1: reproduce identity/container/discriminant fixtures; inspect tuple alignment, synchronous callback and exceptional outcomes; curate a small fixed-version development pilot with independent typing clients; review aliasing, source/export identity and coincidences. Deliver input hashes, per-invocation explanations, clean compiler runs and counterexamples.

Week 2: run both baselines and relational candidates on the pilot; review valid and invalid held-out clients blind to configuration; freeze API eligibility, support/diversity/budgets and the primary metric; decide whether bounded relationships support a five-month publication claim. Keep final evaluation packages untouched. The week-by-week plan below applies with Track B client/reference curation replacing Track A evidence/filtering refinements where appropriate.

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

Artifact contents: source and exact upstream provenance; dependency lock and runtime image digests; versioned schemas; immutable package/family/split manifests and tarball integrity; README/test/reference source hashes; limited-container commands; raw observations and diagnostics; predictions; exclusions, failures and annotation decisions; seed/threshold metadata; table/statistics scripts; clean build/test instructions and manuscript figure/table derivations. Keep host paths and credentials out of any published artifact. The existing private upstream is already authorized and synced. Further publication of third-party/raw artifacts or changes in visibility require explicit review.
