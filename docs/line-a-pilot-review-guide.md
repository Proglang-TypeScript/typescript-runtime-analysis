# Human review guide: Line A two-package pilot

## Reviewer task

Review independently before discussing disagreements. Use the exact package/version and reference commit in `experiments/line-a-pilot/manifest.json`. Do not infer correctness from the generated declaration or from another reviewer. Record **yes**, **no**, or **uncertain**, with a source path/line and short reason.

### Package identity and reference

1. Does the candidate `types/ms/index.d.ts` describe `ms@2.1.3`, including the string-to-number and number-to-string root overloads?
2. Does the candidate `types/qs/index.d.ts` describe `qs@6.15.3`, especially `parse`, `stringify` and the public `formats` value?
3. Are any reference declarations version-ahead, version-behind or intentionally omitting runtime-accessible APIs?

### Export identity

4. For `ms`, should `parse`, `fmtShort`, `fmtLong` or `plural` ever be public members? If not, mark each unfiltered occurrence as contamination.
5. For `qs`, are `parse` and `stringify` the complete callable root-member set represented by the candidate reference?
6. The runtime inventory reaches callable values below `formats.formatters`. Are those intentionally public, accidentally reachable internals, or outside the reference's supported API? Answer separately for each path in `results/qs/filtered-union/index.d.ts`.
7. Does any generated path alias the same callable in a way that should count once for signatures but separately for export-path recall?

### Signatures and clients

8. For each generated root/member overload, classify it as exact, safe-but-imprecise, unsafe, unsupported-reference, or contamination.
9. Is withholding `qs.stringify` preferable to emitting a shallow `object -> string` signature? State what evidence would justify either decision.
10. Confirm the expected pass/fail label for every client in `experiments/line-a-pilot/clients/`. Flag clients that test only path presence rather than a meaningful type distinction.
11. Identify any diagnostic that should change the denominator rather than count as a false negative.

### Final reviewer output

Provide one row per reference callable path with package, path, overload/signature text, supported by runtime backend, reference status, generated status in four arms, and notes. Then answer:

- Is the package eligible under the current CommonJS scope?
- What is the reviewed signature denominator?
- Which generated signatures are true positives, false positives and false negatives?
- Is the public-boundary policy acceptable without package-specific exceptions?
- Should the package remain in development, move to validation, or be excluded?

Expected effort is **30–60 minutes per reviewer** for both packages: 10–15 minutes for provenance/reference fit, 15–30 minutes for paths/signatures, and 5–15 minutes for clients/decision. The smallest useful contribution is one package's export-identity questions (items 4–7), approximately 10–20 minutes.
