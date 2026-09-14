# Development-only census infrastructure smoke

Six sparse DefinitelyTyped packages at the checked-in snapshot pin. This is not the full census, a manually validated benchmark, or held-out evaluation data. Package shards retain machine declaration rows, source/attribution hashes/comments, compiler diagnostics and extraction provenance. React's missing external csstype declaration remains explicit.

The original run used the task's pinned sparse checkout; its exact command/provenance/implementation hash are in run.json. No DefinitelyTyped dependencies or runtime packages were installed or executed. Public anonymous npm metadata for the explicitly selected d3-array/lodash versions is under availability; it is not security or executability certification. Runtime assessment is empty/not-assessed and manual review is pending.

Regenerate all per-declaration JSONL/CSV, summary and stratified queue from retained shards (these larger duplicate tables are not retained):

```sh
npm run census:aggregate -- --out experiments/results/census-smoke
```

To repeat extraction from source, prepare the pinned development checkout and run into a fresh directory as documented in docs/generic-api-census.md. Do not overwrite completed user reviews. Review/development refinement must not use eventual held-out data. Declaration snippets retain the original source attribution and LICENSES/DefinitelyTyped.txt.
