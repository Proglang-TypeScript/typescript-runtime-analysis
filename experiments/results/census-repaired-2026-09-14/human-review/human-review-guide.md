# Independent human review: census and runtime pilot

## 1. Purpose and boundaries

Answer whether the extracted declarations and bounded syntactic categories are accurate, whether proposed runtime mappings/recipes are credible, and whether package origins are independent source families. These are **three different assessments**. A generic declaration, passing ordinary calls, or passing finite seal trials is not a proof of parametricity.

Use two named human reviewers. Each completes their own worksheet **before reading the other review or earlier agent verdicts**. AI assistance must be disclosed; two AI runs do not count as two independent human reviews. Record affiliation, relevant authorship/conflicts, date, and whether independence was maintained. The comparison software checks these declarations, not the reviewers' real-world identity.

This is a stratified sample, up to five declarations per category, not a random population sample. The same declaration may appear in multiple categories: decide each category separately. Do not use its agreement rate as a corpus-wide error-rate estimate.

## 2. Materials and setup

Start with `review-pack-manifest.json`, then your assigned `reviewer-a.json` or `reviewer-b.json`. The manifest fixes the census identity, pinned DefinitelyTyped commit, queue hash, coverage and sample size. Each item supplies a pinned source link, source SHA-256, exact position, signature, export path, binding kind, occurrence routes, unsupported reasons and diagnostic counts. No earlier agent verdict is included.

Copy your assigned worksheet into a separate working location before filling it in. Keep the distributed bundle/templates and their checksums unchanged. Submit the completed copy; the census identity and queue hash must still match the original pack.

For prose rather than JSON editing, copy `reviewer-worksheet.md`: it lists every sampled item, source link, signature and all ten questions with answer spaces. The maintainer can transcribe your submitted prose into the assigned JSON worksheet before comparison, preserving the original prose and asking you to confirm the transcription. The JSON comparison is not a replacement for your review.

Read the **whole declaration and enclosing context** through the pinned source link; do not rely on the excerpt alone. Check imports, aliases, class/interface parameters, overload neighbors and export assignment. A retained diagnostic count is capped; no retained diagnostic at a source location does not establish completeness.

No duplicate DefinitelyTyped checkout is needed. The existing snapshot can be reused. Do not install its dependencies or execute arbitrary packages on your host. Runtime reruns require the documented network-disabled container profile, exact locks and resource limits. Ask the maintainer to prepare an isolated run if you cannot safely reproduce it.

For a completed local census, the maintainer generates a fresh review pack from the repository root:

```sh
node --max-old-space-size=4096 scripts/census-human-review.cjs prepare \
  --census /absolute/path/to/census-repaired-full \
  --snapshot /absolute/path/to/work/definitelytyped \
  --out /absolute/path/to/new-human-review-pack
```

Replace all three paths. Keep the resulting identity and queue hash unchanged. The command refuses to overwrite reviewer work and checks snapshot/source hashes. A completed extraction may still have compiler diagnostics or partial entry coverage: completion is not completeness.

## 3. Questions for EVERY sampled classification

Enter a nonempty answer to **Q1–Q10** in each record's `answers` object. Use “yes”, “no”, “unclear”, or “not assessed” where appropriate, followed by a reason and evidence. “Not assessed” is valid for runtime work not yet carried out; do not invent executions. Cite pinned file/line links, artifact paths/hashes, or exact commands/results in `evidence`.

1. **Q1 — Source and counting:** Does the pinned declaration match the excerpt, hash and coordinates? Is this one formal declaration, one overload, one export/signature pair, or a package? Are several aliases legitimately referencing the same declaration?
2. **Q2 — Public reachability:** Can this callable be reached from the advertised module export? What is the exact module/property chain? Is it a value, an instance member needing a receiver, or type-only? Is an inherited/imported declaration being mistaken for a standalone function?
3. **Q3 — Generic scope:** Which type variables belong to this signature and which to its enclosing interface/class/type alias? What constraints or substitutions apply? Is the exported context specialized? Are rest arguments and overloads relevant?
4. **Q4 — Polarity:** For each variable, trace its occurrences from the outer input/result. Inputs start negative, results positive; entering a callback parameter flips polarity. Which routes preserve it, which flip it, and which remain unknown? Does recorded evidence match this derivation?
5. **Q5 — Category:** Does the item meet the specific rubric below? Point to the actual occurrences. A shared type-variable spelling or an array nested inside a callback is insufficient.
6. **Q6 — Uncertainty:** Do unresolved dependencies, missing entry variants, capped diagnostics, recursive aliases, unsupported syntax or unknown variance affect the verdict? What additional source or compiler check is needed?
7. **Q7 — Runtime mapping:** Is an exact npm package/version/integrity and CommonJS/ESM entry established? Does it match this declaration line? If not investigated, explicitly say “not assessed”. Declaration presence does not establish executability.
8. **Q8 — Invocation:** Can you describe a valid recipe: receiver, setup, arguments, domain/preconditions, callbacks, async completion, expected result/exception and cleanup? If not tested, label it proposed or not assessed.
9. **Q9 — Limits of evidence:** Does this item provide syntactic evidence, finite ordinary-call evidence, or actual seal evidence? What claim would overstate the result? Does it say anything about arbitrary type instantiations or only selected inputs?
10. **Q10 — Decision:** Choose one verdict below. Explain the correction/blocker, cite evidence and state confidence (high/medium/low). List any required follow-up.

### Bounded category rubric

| Category | Question to answer | Important trap |
|---|---|---|
| identity | Is there an outer direct negative occurrence and outer direct positive occurrence of the relevant variable under the documented positional rule? | A union projection is not necessarily pure `T -> T`; side effects are not ruled out. |
| container-element | Is a negative occurrence beneath an outer array/container route paired with an outer direct positive occurrence? | An array of callbacks returning `T` is not an input container of `T` elements. |
| value-to-container | Is an outer direct negative occurrence paired with a positive occurrence beneath an outer array/container route? | A callback's array parameter is not the outer function's result container. |
| multiple-arguments | Does a variable occur across multiple recorded argument indices with the requisite polarities? | Nested callback occurrences may qualify syntactically; distinguish this from two direct `T` arguments. |
| constrained-generic | Is the relevant variable explicitly constrained? What operations does the constraint permit? | Constraints are not freely parametric variables; enclosing constraints also matter. |
| higher-order | Is a function/callable boundary traversed? Are callback-parameter polarity flips correct? | Do not treat callback input/output marginals as outer input/output. |
| overload-or-discriminated | Are overload alternatives or literal/discriminated parameter forms present? What is the exact branch? | An overload's observation does not validate every other branch. |
| unsupported | Is there a recorded feature beyond the bounded analysis (unknown variance, mutable structure, indexed/conditional/mapped type, etc.)? | Unsupported means uncertainty, not known bipolar evidence or a refuted API. |

Categories are nonexclusive. `firstOrderPotential` is a prioritization flag, not a certificate of a free runtime generic. Unknown polarity must never be turned into both polarities without evidence.

### Verdicts and worksheet fields

- `agree`: this **category** is supported under the bounded rubric; mention any runtime or completeness limits.
- `false-classification`: the category/occurrence evidence is wrong; specify the correct interpretation and minimal regression case.
- `ambiguous`: evidence is insufficient or the rule has an unresolved interpretation; identify what would settle it.
- `excluded`: this item should not be in the stated analysis scope; give the scope rule and source evidence.

Replace `status: "pending"` with the verdict, set `reviewer` to your profile's exact name, fill `notes` with the rationale, answer all ten questions, and add at least one evidence reference. Keep review IDs/category/candidate IDs unchanged. Fill the profile: `role: "human"`, real name, date, conflicts (explicit “none” if applicable), and `independentReviewConfirmed: true` only if true. Leave unreviewed items pending; they cannot be submitted as a complete review.

## 4. Runtime pilot review — separate worksheet

Use `runtime-review-template.json`, the earlier compact follow-up's `pilot-selection.json`, exact catalogue, locks, recipes, execution receipts and audits. **Those pilot receipts belong to the earlier baseline identity**; they do not automatically validate a new census. Match export/declaration IDs before any re-intake.

Answer for each of the five pilot exports:

1. Is the exact package/version/integrity in the lock identical to the catalogue? Does the declared major/minor line match? Are registry/repository/source-commit claims corroborated?
2. Does the recipe load the correct export with the correct import mode, receiver and call kind? Is a wrapper export being confused with the external callee?
3. Are arguments valid and reproducible? Which objects/arrays preserve identity or aliasing? Which domain boundaries, empty cases, exceptions, callbacks or async paths were omitted?
4. Do the actual execution receipt, stdout assertions and source-inventory hashes establish that this ordinary call ran and returned/threw as reported? What would falsify that claim?
5. Was execution network-disabled, read-only and credential-free with the recorded image and limits? Were lifecycle scripts disabled during preparation? Is reproduction safe?
6. Does the trace instrument the actual dependency or only the client wrapper? Which callee-internal behavior remains unobserved?
7. Were any **active seal trials** performed for this exact recipe? If not, mark seal evidence absent. A finite ordinary pass must not be relabeled a seal pass or proof.
8. What verdict applies: verified finite ordinary exercise, mapping unresolved, recipe invalid, receipt insufficient, or not assessed? What should be tested next?

Known boundary to independently assess: `prelude-ls.head([])` returns `undefined` although the declaration result is `A`. Does the recipe require nonempty input? Is that restriction represented in the declaration or only in the test? Do not approve the unrestricted declaration merely because nonempty cases passed.

The pilots are development data, **not untouched held-out data**. Underscore appeared in development smoke. No human verdict here can undo that exposure.

## 5. Source-family independence — separate worksheet

Use `family-review-template.json` and `family-origin-evidence.json`. One npm name is not one independent source family. A family is shared implementation ancestry/copying for the relevant functions, not merely a distinct owner, repository URL or licence.

For each package, answer:

1. What is the canonical source repository and exact published source commit? Can the npm tarball be linked to it? Is the mapping unresolved or the repository unavailable?
2. Is it a fork, renamed/moved repository, repackaging, vendored implementation, or generated distribution of another source? Cite history/attribution evidence.
3. Where did the relevant function implementation originate? Are comments, substantial code, tests or structure copied/shared with another selected package? Tiny `return value` bodies and common licence text alone cannot prove ancestry.
4. Which packages must be grouped into one family? What family identifier and provenance justify the grouping? What remains uncertain?
5. Has the package/family been used in development, pilot selection or tuning? If yes, exclude it from untouched held-out evaluation.

For **each pair** of the three packages, decide `same-family`, `distinct-family`, or `unclear`, with evidence and rationale. `fork: false` is not proof of independence. Exact source-file hash checks are only preliminary screens; no identical whole file does not exclude adapted copying. Until reviewed, provisional family labels contribute **zero verified independent families**.

Priority ambiguity: npm metadata names `cognitect/npm-transducers-js`, while declarations name `cognitect-labs/transducers-js`. Public API lookups of the former origin and the published source commit at the latter returned 404 during preparation. Establish the true source mapping or keep it unresolved; do not substitute an unverified current commit.

## 6. Compare, adjudicate and deliver

When both blind reviews are complete, compare them from the repository root:

```sh
node scripts/census-human-review.cjs compare \
  --census /absolute/path/to/census-repaired-full \
  --first /absolute/path/to/human-review-pack/reviewer-a.json \
  --second /absolute/path/to/human-review-pack/reviewer-b.json \
  --out /absolute/path/to/new-human-review-comparison.json
```

This refuses incomplete answers, duplicate/unknown items, mismatched census/queue hashes, identical reviewer names and overwrite. It reports agreement/disagreement; it **does not adjudicate**, authenticate humans, estimate population accuracy, validate family independence or prove parametricity.

Discuss disagreements only after saving both originals. Keep originals immutable; produce a separate adjudication log with item ID, both verdicts, source evidence, final decision, adjudicator/date and unresolved issues. Agreement on `ambiguous` still leaves an unresolved item. Compare to prior agent findings only after independent submissions; preserve dissent rather than forcing consensus.

Return: both completed classification worksheets, comparison report, separate adjudication log, runtime worksheet, family worksheet, and a concise list of blockers/corrections. Store no duplicate dependency trees or DefinitelyTyped checkout. Include attribution and record source URLs/commits/hashes.

The study gate remains **100 executable functions / 25 independent packages** as specified by the outline, with conservative source-family grouping and held-out controls. This sample and three-package pilot do not meet that gate. Preserve the earlier Line A readiness recommendation until the specified evidence actually supports changing it.
