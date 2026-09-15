# Line A public-export boundary audit

## Scope and baseline

This audit is development infrastructure for **Line A: public-API reconstruction from heterogeneous runtime evidence**. It is not a real-package effectiveness result. The branch `line-a-public-export-audit` starts from `origin/master` at `9ea34565dfd95f8f62f79a4d9f262c62a86b4a84`; the separate census branch remains untouched.

The earlier tracer marked **any** function returned by a `require()` call as exported and used `requiredModule` alone as a public filter. That could promote an unrelated helper imported by a package test. It also traversed exported objects with `for...in` and read each value, potentially executing export getters during tracing. Object aliases/re-exports had no preserved property-path identity, and the legacy declaration builder could flatten an object member into an incorrect top-level function.

## Audited policy

`commonjs-own-descriptor-v1` inventories the configured **relative local public module** when `require('./module')` or its explicit `.js` form returns. It does not treat a bare `require('module')` as equivalent: that could resolve a built-in or unrelated package with the same spelling. Bare package imports require a later resolved-package-identity policy. It does not label functions returned by other imports. It uses **own data-property descriptors**, not prototype enumeration or getter invocation, and records each reachable function's property paths. A direct callable root has path `[]`; an object property such as `api.alias` has `['alias']`. Independent aliases retain separate paths, including re-exported functions. Recursive object aliases are cut with an explicit exclusion. The scan is bounded to depth four and 1,000 inspected properties per inventory; proxy descriptor failures, accessors and symbol keys remain explicit exclusions.

The raw sidecar adds `publicExports` with its own `schemaVersion: 1`, policy, raw function IDs, property paths, matched imports and exclusions. A parallel `<trace>.public-exports.json` file is generated for audit. Normalized trace/invocation records retain `public: boolean` but now also carry `exportPaths`; provenance records `publicBoundary: commonjs-own-descriptor-v1`. Older trace files without that field remain readable. The old raw `requiredModule` and `isExported` fields remain available for historical comparison but no longer decide new `public` flags.

At audit commit `d501ccf`, the declaration generator's public-only mode used the new raw inventory, retained direct `export =` callable generation, and withheld object members with `UNSUPPORTED_PUBLIC_EXPORT_PATH` rather than flattening them. The [subsequent object-member extension](line-a-object-member-extension.md) emits supported own-data-property object paths. Unrelated helpers receive `FILTERED_INTERNAL_API`. Historical raw files lacking the inventory still use the old boundary with `LEGACY_PUBLIC_BOUNDARY_UNVERIFIED`, making this fallback visible rather than silently certified.

## Regression evidence

The focused tests exercise:

- exact configured-module matching versus unrelated/nested imports;
- a callable root and a separately imported private helper;
- own nonenumerable properties, nested object members and independent aliases;
- a re-exported implementation function retaining three public paths;
- getter opacity and a cyclic export object without crashing the tracer;
- a public constructor, non-public instance prototype method and separately tracked static path;
- symbolic, deep and proxy-descriptor exclusions;
- public-only generation for direct roots and explicit abstention for object members.

The prior getter fixture caused the original tracer to throw `export getter evaluated` in its `for...in` require scan. With the new policy, the same style of checked-in first-party fixture runs, records `accessor-export-not-inspected`, retains public aliases and marks an unrelated `privateHelper` non-public. The six focused audit tests pass. The maintained build, complete test suite (110 Jest assertions and 39 Node tests), and first-party smoke also pass with Node 24.21.0 and a 4 GB parent heap. No tracked experiment results or third-party checkouts were changed by validation.

## Remaining limits and next Line A work

This policy observes the exported object **at a matching relative require**, not every later mutation of `module.exports` or its properties. It does not execute accessors; getters may expose public callables but are unresolved. `Object.getOwnPropertyDescriptors` on a Proxy may run proxy traps even though property getters are not called, so untrusted packages still require the documented isolated container. Bare package imports, symbols, inherited/prototype instance members, dynamic subpaths, ESM, conditional exports, non-CommonJS module shapes, and deeply nested/oversized objects are not complete public API discovery. Constructor receivers/instance methods require a separate, versioned member-identity policy rather than marking prototype methods as root exports.

The normalized `functionId` identifies a source function, while `exportPaths` names independent routes to it. The [follow-up builder/export-identity extension](line-a-object-member-extension.md) validates a first-party object-member fixture. The next empirical step is a fixed-version development package pilot comparing README-only, tests-only, unfiltered union and filtered union. Keep eligibility, exclusions, runtime image/lock/reference provenance and human-reviewed reference declarations separate. The audit and first-party fixture alone provide no empirical quality-improvement claim.

Do not check in raw runtime sidecars from third-party packages without reviewing source/provenance paths and attribution. The branch currently contains only first-party code/tests/documentation; no external code or DefinitelyTyped checkout is introduced.
