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

## Track B protocol: sealing-based relational validation

**Claim to investigate:** fresh polarity-directed seals can falsify coincidental parametric hypotheses and support bounded constraint refinements while preserving independently labeled valid-client precision.

**Primary hypothesis:** active sealing/refinement rejects more independently labeled false-parametric hypotheses than passive relational generalization, with no more than a preregistered five percentage-point reduction in macro-family valid-client acceptance with required result precision. This proposed tolerance and challenge budgets must be frozen on development/validation data, not evaluation. Finite trials are never proof of universal soundness.

**Primary metric:** macro-family invalid held-out client rejection, accompanied by the valid-client acceptance constraint. Report false-parametric hypothesis detection against independently reviewed provider labels, inference-client compatibility, declaration validity, signature size, time/memory and coverage. Report passed, seal-violation, ordinary exception, timeout, inconclusive and harness-failure separately, with all-selected and supported-API denominators. Unsupported cases are neither successes nor failures; report the coverage tradeoff rather than silently excluding them.

**Baselines/ablations:** component-wise unions, overload-per-observation, passive relational generalization and active sealing/refinement; optionally version-matched handwritten declarations. Ablate diverse challenges, constraints and callback polarity after format/version preservation. Separate rejection from non-generic fallback quality; fallback overloads are not sealing proof. No ML, arbitrary conditional/mapped types or full polymorphic inference is needed.

**Dataset/splits:** freeze package/version, family/source lineage, commit, tarball integrity, dependency lock, image and source/client hashes. Curate family development/validation/evaluation splits before tuning. Within APIs keep proposing tuples, development challenge evidence and final held-out valid/invalid clients distinct. Retain aligned arguments, receiver, result, callback and outcome observations; never fabricate tuples from independent marginals. Freeze candidate/challenge budgets, eligibility and constraints using development/validation only. Independently label provider behavior and valid/invalid clients with two reviewers and retain disagreements. Evaluation counterexamples must not refine the frozen algorithm or declarations used for that evaluation.

**Bounded scope:** existing passive unary equality/container-element, shallow discriminated overload and correlated-union candidates remain interfaces. Initial active validation covers first-order identity hypotheses and shallow string-field constraints; callbacks reverse polarity where supported. Fresh brands are per instantiation/type variable, not interchangeable per occurrence. Record proposing invocations, every sealed trial, concrete controls, counterexamples, inconclusive outcomes and refinement decisions. Re-challenge justified constraints; report observational overloads as unvalidated fallback.

**Exclusions/falsification controls:** unsupported primitive boxing, proxy observability, coercion, typeof, truthiness/equality/object identity, serialization and native calls are explicitly inconclusive. Async/ESM, receiver/constructor inference, getters, arbitrary containers and unmapped source forms remain outside active scope. Use known parametric transport, known coincidentally correlated constant providers, supported opaque-object access and unsupported primitive/native controls to distinguish real seal violations from wrapper artifacts. Keep ordinary exceptions, timeout and harness failures visible. External packages require actual limited containers; an isolation environment marker is not a sandbox.

**Statistical analysis:** paired package-family differences, family-cluster bootstrap confidence intervals and a paired permutation test against each baseline. Report effect sizes and valid/invalid/coverage tradeoffs, adjusting secondary comparisons with Holm's procedure. Determine sample size from a development pilot; invocations/trials within an API are not independent statistical samples.

**Current artifact:** `npm run experiment:sealing` collects actual proposing tuples, challenges hypotheses with fresh seals, re-challenges a justified constraint and exposes passive false-generic held-out acceptance. Four declarations, six outcome classes, independent TypeScript6/native7 clients, raw evidence and reproducible CSV tables are retained. Known identity transports fresh seals; a coincidentally correlated non-parametric fixture produces correctly classified violations; unsupported interactions are inconclusive. This is synthetic infrastructure, not cross-package publication evidence. Passive synthesis remains `npm run experiment:relational`; legacy pattern prediction remains a reference workflow.

## First two weeks if Track B is selected

Week 1: reproduce known parametric/non-parametric transport, fresh brands, callback polarity and unsupported-observability fixtures; inspect tuples, controls and six outcome classes; curate a fixed-version development pilot with independently labeled providers and valid/invalid clients. Deliver hashes, supported-scope explanations and genuine counterexamples distinct from wrapper artifacts.

Week 2: run all four configurations on the pilot; review valid/invalid clients and false-parametric provider labels blind to configuration; freeze eligibility, support, challenge/constraint budgets and metrics; decide whether falsification quality and coverage support a five-month claim. Keep final evaluation packages untouched. The weekly plan below substitutes Track B challenge/client/provider curation for Track A evidence/filtering work.

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
