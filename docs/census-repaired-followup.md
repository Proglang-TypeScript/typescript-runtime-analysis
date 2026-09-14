# Repaired full census and independent human review

## Provenance and completion

Repository: `https://github.com/Proglang-TypeScript/typescript-runtime-analysis.git`, branch `phase-2-census-infrastructure`, base commit `f5dbf48ff311ccc0f0baba0c1fb6206b105e3c9d`. The bundle retains exact implementation source hashes and historical prepublication capture metadata. The subsequent explicit commit/check-in request authorizes publication of this follow-up; publication is verified separately rather than rewriting the original capture state. Earlier published bundles and their raw inputs remain unchanged.

The fresh full run reused the existing DefinitelyTyped checkout at `455254aa7204192e7f7fbe50266d2313cefdf6c9`, with TypeScript 6.0.3 and Node 24.21.0. Its identity is `191105aee86637c2edcfcec4673aed7314ddcb074beb0d6ee23e22f192cbed79`. All **8,680 packages** were processed: 8,679 successful extractions, zero fatal extraction failures, one explicit partial-entry package, no pending packages. Extraction took approximately 53 minutes; final aggregation completed separately. Exit status 1 reflects the incomplete entry, not a worker crash or unfinished run.

The compact results and review forms are under [census-repaired-2026-09-14](../experiments/results/census-repaired-2026-09-14/README.md). No DefinitelyTyped checkout, installed dependency tree or expanded raw rows are included. The compact completion record is not resumable; retain local raw outputs.

## Repairs and remaining entry gap

Go's 298,369 export/signature pairs reference only 905 formal declarations. Expanded row serialization exceeded 313 MB. Lossless template/reference storage now retains every ID, property chain, overload, classification and source field while avoiding repeated signature payloads. Its actual worker completed within the unchanged 256 MB output, 1 GB heap, two-minute and 1 MB log limits. Canonical compact storage is approximately 112 MiB. Extraction still materializes rows and is **not fully streamed**.

Worker transport, canonical resume, aggregation and runtime intake decode the versioned storage envelope to logical schema version 1. Legacy expanded shards remain readable, but changed implementation identity still prohibits cross-version resume. Tests compare complete row round trips and compact/expanded aggregate output, including malformed-reference rejection.

`beyonk__gdpr-cookie-consent-banner` has primary `index.d.ts` and two retained signature pairs, but its pinned manifest advertises an absent `esm/index.d.ts` import branch. New `partial-entry` status and `entryCoverage` name the missing branch, separately from fatal failures. Resume preserves the partial result without claiming completeness. A public upstream directory check also found no ESM directory. No source or conditional export was fabricated/discarded. A genuine upstream repair requires validating ESM semantics, reviewing the source fix and updating the snapshot pin for a fresh run.

## Full-run comparison

| Metric | Earlier baseline | Fresh repaired full run |
|---|---:|---:|
| Formal callable declarations | 145,776 | 172,156 |
| Export/signature pairs | 1,161,271 | 1,871,316 |
| Distinct callable exports | 894,014 | 1,513,756 |
| Declarations with scoped/formal type parameters | 22,180 | 23,705 |
| Declarations with both known polarities | 2,558 | 2,603 |
| First-order prioritization declarations | 272 | 276 |
| Compiler-diagnostic packages | 3,738 | 3,750 |
| Fatal extraction failures | 21 (including missing entry) | 0 |
| Explicit partial-entry packages | included above | 1 |

`baseline-comparison.json` records all numerical/class deltas. The same pin was used, but software identities differ. Imported/inherited declarations and independent export paths make subset counts nonadditive; this comparison uses a fresh full rerun, not arithmetic merging of a failure subset. The reduced container tags (87 container-element / 30 value-to-container) reflect callback-boundary classification repairs as well as newly extracted packages. None of these counts establishes runtime executability or parametricity.

The pinned-only resolver still produces diagnostics in 3,750 packages. Retained examples are capped; absence of a retained match is not dependency or semantic completeness. External declaration-overlay policy remains separate work.

## Human review package

Start with [the structured human guide](human-review-guide.md) or the results bundle's `human-review/human-review-guide.md`. The fresh stratified queue has **40 pending category items representing 36 distinct declarations**. Two named humans should independently answer Q1–Q10 before seeing each other's or earlier agent verdicts. The pack supplies pinned URLs/hashes, source signatures, bindings, generic context and diagnostic caveats. `reviewer-worksheet.md` supports prose answers; `reviewer-a.json` and `reviewer-b.json` support validated comparison. Copy templates before editing.

Separate worksheets address eight runtime questions for each of the five earlier development pilot exports, five family questions per package and all three package-pair ancestry decisions. Earlier runtime receipts retain baseline identity `8235039d24e334ab26863f6a87cb8f828ff91f75dbfbe01bcf9d2a9cd4f7dcf0`; no automatic re-intake into this new census occurred.

Preliminary source-origin corroboration finds all six installed Prelude source files matching Git blobs at its published commit. Underscore has 174 exact blob matches among 492 installed script files; generated/unmatched files need separate build provenance. The named transducers npm origin and its recorded published commit at the declaration project origin returned 404. Whole-file hashes, distinct names and `fork:false` do not prove ancestry independence. **Zero source families are independently certified**.

The comparison tool requires complete answers, exact queue identity, unchanged candidate/category IDs and two distinct self-declared human profiles. It cannot authenticate humans, certify independence, adjudicate disagreements or prove parametricity. All human forms remain pending; preserve originals and log adjudication separately.

## Validation and preservation

The maintained check passes build, 175 tests (110 Jest / 65 Node), smoke and experiment. The 27 census tests include lossless storage, legacy/compact aggregate equivalence, partial coverage/resume and previous checkpoint/cycle/polarity regressions. Five reviewer comparison tests cover incomplete/mismatched/nonhuman/duplicate reviews and explicit unadjudicated disagreement. Real worker and review-pack generation also succeeded.

One optional final default-heap recheck hit a native Node SIGSEGV during Jest, without a failing assertion. Immediate Node 24 Jest retry with a 4 GB parent heap passed all 110 tests; the complete check was rerun using `NODE_OPTIONS=--max-old-space-size=4096`. The isolated native crash cause is not established; no unrelated repository workaround was added.

Verification matched all 8,680 original baseline shard hashes, five original source-result files, all compact baseline/follow-up checksums and 21 prior supplemental shards. No pinned checkout was duplicated or changed. No upstream issue/PR submission was made. The bundle's uncommitted/unpushed fields describe its original evidence capture, not the subsequent authorized publication.

Independent human validation, full semantic dependency coverage, expanded runtime recipes, active sealing and held-out curation remain pending. The **100 executable functions / 25 independent packages** gate is not met by a declaration census or three development packages. Preserve the earlier Line A readiness recommendation until the required study evidence is genuinely evaluated.
