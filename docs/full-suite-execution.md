# Reproducible full-suite execution

The full-suite workflow separates dependency preparation from external-code execution. Preparation is the only networked stage: it copies the exact package source, installs development dependencies from a verified lock without lifecycle scripts, writes a deterministic Mocha or Tape harness, and records hashes. Execution mounts that prepared tree read-only in the pinned Node 24 container with networking disabled, bounded CPU, memory, processes, temporary storage, observations and wall time. Every selected test executes unchanged; instrumentation is limited to the small root-loading harness and package implementation, so assertion/framework internals do not become provider evidence or dominate the execution budget. These profiles also enable transparent tracing: argument and result values are observed but never replaced with wrapper objects or proxies, preserving strict equality, native-class and cyclic-object behavior in the authoritative upstream tests.

Full suites retain observations up to the profile budget and then keep deterministic periodic samples, rather than terminating the tests on repetitive workloads. `trace.json.execution.json` records the limit, total events seen, retained and dropped counts, sampling interval and whether truncation occurred. Treat a truncated trace as broad suite coverage rather than exhaustive event-frequency evidence.

Use exact source checkouts for the two development profiles:

```sh
node scripts/prepare-full-suite.cjs /path/to/ms work/full-suite/ms ms-2.1.3
node scripts/run-full-suite-isolated.cjs work/full-suite/ms work/full-suite-runs/ms ms-2.1.3

node scripts/prepare-full-suite.cjs /path/to/qs work/full-suite/qs qs-6.15.3
node scripts/run-full-suite-isolated.cjs work/full-suite/qs work/full-suite-runs/qs qs-6.15.3
```

`ms@2.1.3` uses its committed npm lock and runs every test in `tests.js` through `mocha@4.0.1`. `qs@6.15.3` has no source lock, so preparation generates one from exact runtime dependencies plus every external module imported by `test/**/*.js`, requires its reviewed SHA-256, and then performs `npm ci`. This avoids unrelated lint, documentation and release tooling, including Git dependencies absent from the pinned slim image, without omitting any Tape test dependency. Tape is invoked directly rather than through `nyc`, because coverage rewriting is not part of runtime-signature evidence. Do not use `npm test` for `qs`: its pre/post hooks add lint, README generation and a networked audit outside the test suite.

For Line B invocation tuples, add `--invocations` to the execution command. The output includes the trace sidecars, `full-suite.json`, preparation record, generated harness and exact package lock. These compact provenance files can be retained without checking in the package checkout or `node_modules`.

Preparation deliberately fails if the destination already exists, source hashes differ, the package/version is wrong, or the resulting lock differs from the profile. Execution likewise refuses to overwrite a result directory and fails if prepared tests, harness or lock changed, if the framework is missing, if tests fail, or if a resource bound is reached. Remove or choose a new ignored `work/full-suite` directory explicitly when a new preparation or run is intended.

## Validation record

Validated on 2026-09-19 with the pinned Node image and offline execution stage:

- `ms@2.1.3`: all 49 Mocha tests passed; 1,917 events were retained without truncation.
- `qs@6.15.3`: all 1,013 Tape assertions passed; 663,346 events were seen, with the 250,000-event prefix plus 413 deterministic later samples retained and truncation reported.
- Line B invocation mode: the complete `ms` suite passed and retained 193 invocation tuples without truncation.
- Repository validation: build, Jest, Node tests and smoke checks passed on baseline, Line A and Line B.
