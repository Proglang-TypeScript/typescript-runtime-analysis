# Full pinned census: compact evidence bundle

This bundle documents an attempted census of all **8,680** type-package directories at DefinitelyTyped commit [455254aa7204192e7f7fbe50266d2313cefdf6c9](https://github.com/DefinitelyTyped/DefinitelyTyped/commit/455254aa7204192e7f7fbe50266d2313cefdf6c9). It does not contain the DefinitelyTyped checkout, raw package shards or redundant combined declaration tables. It is **not a resumable checkpoint**.

Software: [Proglang-TypeScript/typescript-runtime-analysis, cd895cc](https://github.com/Proglang-TypeScript/typescript-runtime-analysis/commit/cd895cc3664f4d47de96e2fc9b083cf6084ed7b8). Census identity: `8235039d24e334ab26863f6a87cb8f828ff91f75dbfbe01bcf9d2a9cd4f7dcf0`. Compiler, implementation hash, pin, selection, seed, original command and worker limits are retained in `run.json`.

## Findings and limitations

- Traversal finished with no pending packages: 8,659 extracted packages, including 3,738 with compiler diagnostics; 21 failed/missing entries. Completion is not an error-free census or independent validation.
- Provisional deduplicated counts: 145,776 callable declarations; 22,180 declarations with formal type parameters; 2,558 with known negative and positive occurrences. There are 1,161,271 export/signature pairs and 894,014 distinct callable exports. These units are different; per-package counts cannot necessarily be summed into global distinct counts.
- The 272 first-order candidates are an unreviewed syntactic shortlist, not proven executable, freely instantiable runtime generics or sealing-ready contracts. The candidate index selects one deterministic export representative per declaration, retains its source link and records the number of associated first-order exports/packages; it is not a complete export catalogue.
- All 40 stratified classification reviews remain pending. Runtime availability/execution remains unassessed. Failure/diagnostic/unsupported cases are explicit and must not be interpreted as absent APIs or validated semantics.
- Diagnostic code counts describe the retained unique diagnostic samples. They are distinct from summed per-entry diagnostic totals. At most two code-distinct message examples per package are retained, truncated to 240 characters; complete diagnostic records remain in raw shards.

## Contents

| File | Purpose |
|---|---|
| `run.json` | Original run provenance/configuration, including exact input and implementation hashes |
| `completion.json` | Compact traversal/budget state; explicitly not resumable |
| `summary.json`, `summary.csv` | Global counts and coverage; bulky package manifests/source notices omitted |
| `packages.csv` | One row per selected package: status, counts, diagnostics and exclusions |
| `failures.json` | All 21 worker/missing-entry cases and retained failure details |
| `diagnostics.jsonl` | One compact diagnostic record per affected package, with bounded examples |
| `review-queue.json` | Original 40-item review queue, source coordinates, occurrence evidence and short declaration excerpts |
| `first-order-candidates.json` | Declaration-deduplicated candidate references, scoped type parameters and representative exports; no copied declaration bodies |
| `raw-shards.sha256` | SHA256 for each of the 8,680 original package shards; raw files not included |
| `bundle-manifest.json` | Source file checksums/sizes, software/input references, packaging policy and validation |
| `DefinitelyTyped-LICENSE.txt` | Original MIT attribution/license for the limited review excerpts |
| `SHA256SUMS` | Integrity checksums for all other bundle files |

Paths in `raw-shards.sha256` are relative to the original raw census directory, not this bundle. The index contains filenames and hashes only. No external raw-data archive has been created or uploaded; `externalRawArchive` is explicitly null in the manifest. Adding an archive later should record its immutable location and SHA256 without committing it to ordinary Git.

## Reproduction and resume

Using the recorded software version, Node.js 24 and its lockfile, from the software repository root:

```sh
npm ci
npm run build
npm run census:prepare -- --out work/definitelytyped
npm run census -- --snapshot work/definitelytyped --out work/census --time-limit-hours 1
```

For an existing compatible raw run, the complete resume call is:

```sh
npm run census -- --snapshot work/definitelytyped --out work/census --time-limit-hours 1 --resume
```

The snapshot/output, selection, review size, compiler and implementation must match. The invocation budget may change or be omitted. Successful validated shards are skipped; failures are retried. Using this compact bundle as `--out` will not work: it deliberately omits shards and the original checkpoint. Preserve the original ignored `work/census` and `work/definitelytyped` locally. Reproduction requires fetching the pinned checkout rather than vendoring it here. Environmental resource failures may vary; retained hashes identify the actual original evidence, not a promise that a rerun is byte-identical.

For completed raw extraction, regenerate combined tables with `npm run census:aggregate -- --out work/census`. The combined CSV/JSONL and complete package JSON remain outside this bundle because they are large or redundant.

Verify bundle integrity from this directory:

```sh
shasum -a 256 -c SHA256SUMS
```

## Validation and next work

Packaging validated the schema and census identity of every shard, recomputed global declaration/export/class counts against the original summary, confirmed 272 distinct candidates and all failure/diagnostic package counts, and checked the source metadata had not changed. Package metrics use declaration/export sets, not raw row totals. The raw hash index fingerprints the actual original shards.

Next: triage the 21 failures and diagnostic coverage, independently inspect the 40 classification samples, then curate reviewed candidate recipes, exact runtime locks, isolated execution evidence and independent source families. Changes to extraction rules require a new output directory; retain this run as baseline evidence. The study's executable-function/independent-package gate cannot be assessed from these counts alone.

The review queue contains limited declaration excerpts from DefinitelyTyped, whose contributors retain the original MIT attribution in `DefinitelyTyped-LICENSE.txt`. Full declaration files, complete source notices and the checkout remain outside this bundle; source URLs identify the pinned originals. Existing repository license/owner policies still apply to generated project artifacts.
