# Security modernization and publication record

Date: 2026-09-14. Workspace: /Users/thiemann/git/typescript. This record supersedes the initial recovery-phase security and publication status. Existing history and user changes were preserved; no force push or PR merge was used.

## Publication

Fresh upstream: [Proglang-TypeScript/typescript-runtime-analysis](https://github.com/Proglang-TypeScript/typescript-runtime-analysis), **private** because preservation material includes a patch from the private concrete-types repository. Its first publication is being finalized; consult GitHub for its current HEAD. Source import revisions remain recorded separately in docs/provenance.md; the revisions below are the newly maintained source heads.

| Repository | Maintained commit | Publication |
|---|---|---|
| [concrete-types](https://github.com/Proglang-TypeScript/concrete-types) | `0d3e9544084ea4eac93d8bf3cc1ef3491c47b279` | pushed |
| [dts-auto-generate](https://github.com/Proglang-TypeScript/dts-auto-generate) | `8e7c5741b16f972ff2428cdb020247231e5b66ef` | pushed |
| [dts-generate-method](https://github.com/Proglang-TypeScript/dts-generate-method) | `4a676721330e15af35f7887cb5bf41d1ccd0520f` | pushed |
| [ts-declaration-file-generator](https://github.com/Proglang-TypeScript/ts-declaration-file-generator) | `b51bd861955f7138e5a4ce0b73d9ba98e0522881` | pushed |
| [ts-ast-utils](https://github.com/Proglang-TypeScript/ts-ast-utils) | `504ac8d348878e858912a119134911eebf438af7` | pushed |
| [ts-visitors](https://github.com/Proglang-TypeScript/ts-visitors) | `640ec99f8dd657cf71196d7a3c7623b608d1fb44` | pushed |
| [js-code-pattern-discovery](https://github.com/Proglang-TypeScript/js-code-pattern-discovery) | `d2cd778129706554ea319273d6be0934d98d516d` | local-commit-only |
| [run-time-information-gathering](https://github.com/Proglang-TypeScript/run-time-information-gathering) | `3a4e4ff79854a61246bb68af389eea7f9bf745fb` | pushed |
| [ts-declaration-file-generator-service](https://github.com/Proglang-TypeScript/ts-declaration-file-generator-service) | `6d6fbb5238f54a2a19354e9e7643e61de60b2e11` | pushed |

Eight maintained existing repositories were pushed. js-code-pattern-discovery was modernized and committed locally, but the authenticated account lacks upstream push permission. Its contribution patch accompanies the outputs. Reference results and the paper repository retain historical content and upstream commits (results 937a89a919814372cae8ea424d88edd8f7eaf87f; paper 972335ae7cdf6778e62feec260579374bc2c4bc0).

## Security findings and changes

- Authenticated GitHub alert enumeration found 69 open alerts: generator29, comparator repository25, tracer15. After publication all three returned **zero open alerts**. concrete-types and service also returned zero. Alert access is disabled/unavailable on some other repositories; those are not described as verified zero.
- All nine maintained executable npm graphs and the consolidated graph were independently audited: zero known advisories at validation. Audits include development dependencies. This is not a guarantee of absence of source-level defects.
- Node24 LTS24.21.0 is the supported execution runtime; the native macOS validation uses npm12.0.2. Container base includes Node24.21.0/npm11.19 and Python3.14.7. The API compiler is TypeScript6.0.3; native7.0.2 is used independently for client checks because it has no compatible compiler API.
- Jest30.5.1, ts-jest29.4.12, ESLint10 and current compatible compiler/linter typings replace unsupported tooling. Lockfiles are regenerated without forced or ignored peer conflicts. New hooks are opt-in; install lifecycle scripts are disabled.
- argparse3.0.2, nanoid6.0.1, Express5.2.1, dotenv17.4.2, glob13.0.6 and yargs18.1.0 migrations include their API changes. Jalangi uses a reviewed11-file vendored runtime and the compatible patched Acorn7.4.1 alias; unrelated legacy browser/server dependency trees are not installed.
- Viewer shell execution was replaced by bounded argument-array execution. Source paths are restricted and realpath-checked, mutation origins and Host headers are checked, and the server binds only to loopback. Traversal/symlink/injection and DNS-rebinding regression tests pass. Unused circular serialization and redundant body-parser dependencies were removed.
- Container helpers use unprivileged users, read-only source/root, separate explicit writable output/work directories, no execution networking, CPU/memory/process/time limits, and dropped capabilities. Installers pin reviewed full source SHAs and preserve prior installations instead of deleting them.
- CI targets Node24 and current official action major versions. Weekly dependency update configurations were added. Release jobs are manual and validate shell arguments instead of interpolating workflow inputs.

## Validation

- Preserved generator65 unit +1 e2e and comparator44 assertions: **110 original assertions**. The consolidated runner also has8 Node regression tests (118 total), four genuine smoke workflows and two synthetic research scaffold runs. No historical assertion was skipped or changed into a placeholder to claim success.
- Independent AST-utils2 and viewer2 security tests pass. Libraries whose original test scripts were placeholders are explicitly not counted as tested; their builds/lints pass.
- All nine source packages clean-install on native Node24. The final clean consolidated Node24/npm12 install, all118 tests, all smoke/experiment workflows and full dependency audit passed after the argparse3 lock refresh (argparse3.0.2 confirmed).
- All six maintained images built. The Python/Node helper verified both versions, a non-root user, writable working copy and non-writable source. The actual service traced the calculator with the final tracer image and generated its declaration with the final generator image.
- Published commit-matched GitHub CI succeeded for generator, AST-utils, visitors and tracer. New viewer/comparator workflows were still running at this snapshot; publication-verification.json records their final observed states. Repositories without workflows are not claimed to have CI passes.

## Unresolved boundaries

1. Pattern repository push permission is absent. Apply the supplied patch or grant the account write access; no unauthorized fork or remote was created.
2. Archived experiment lockfiles in dts-generate-results were preserved, not silently rewritten into new experiments. Their separate npm metadata audit was blocked by automatic review because it exports dependency metadata to the public npm audit service. User approval was requested. The historical corpus is **not cleared for dependency installation/execution**; use a separately frozen and audited corpus for new research.
3. The preserved legacy calculator golden output differs in upstream-added random IDs and transpiled instruction positions. Its old exact-equality profile is not green. The maintained tracer/generator profiles and original generator/comparator assertions are validated separately; historical expected files remain unchanged.
4. ESM/async/Kafka equivalence, arbitrary third-party corpus execution, and the missing upstream /rti/bin/runNew orchestration remain research extensions, not implemented or falsely reported as working.
5. Existing user-owned untracked concrete-types root dependency files and installed modules were left intact and not published. They are not maintained executable package graphs and were not security-certified.

Raw command/audit/test/image/publication records remain in the task workspace work/security; synthetic artifacts are retained with the fresh repository. Security claims are limited to inspected alerts and the maintained dependency graphs at this date.
