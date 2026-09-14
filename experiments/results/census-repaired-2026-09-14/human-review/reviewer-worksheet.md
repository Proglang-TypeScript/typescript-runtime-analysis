# Independent reviewer worksheet

Name:
Date:
Affiliation/conflicts:
Independent blind review completed (yes/no):
AI assistance, if any:

Census identity: 191105aee86637c2edcfcec4673aed7314ddcb074beb0d6ee23e22f192cbed79
Queue SHA-256: 5acc1243e029b4eff3fcf0f87ecc21b0d613f0450746743702e1b5567296d4a8

Copy this worksheet before editing. Read human-review-guide.md. Preserve your original submission; the maintainer can transcribe prose answers into your JSON worksheet for comparison.

## pg: PoolClient.query — identity

Review ID: 63cabd8f7b6c1062aae4044dfdf74613269f94ad73908d929bfab54f1df1d4c9
Candidate ID: d89ee683bdd126df4625da77fd0be57aadca834de3f993dfd430a5f44853d8cf
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/pg/index.d.ts#L251
Source SHA-256: 67f3d03f61a43f045851624e52ec438803ecf5d2247660f208bd9bcadb6ff298
Binding: type-only; kind: method

```ts
query<T extends Submittable>(queryStream: T): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## fs-extra-promise-es6: WriteStream.Stream.Readable.addAbortSignal — identity

Review ID: 4795f611fa57943130ea2138af8c05fd0af4b1a997746a6fd02cb997d2b1be56
Candidate ID: 2580b88b2b7c671dab9fa7791ba9c1c723c64c9407a22b167ef904981113c594
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/stream.d.ts#L1349
Source SHA-256: 5b26c4dd672d88336bb929787c9bfb55119e80ba89ec6dc923da1c063892843e
Binding: value; kind: method

```ts
function addAbortSignal<
            T extends NodeJS.ReadableStream | NodeJS.WritableStream | web.ReadableStream | web.WritableStream,
        >(signal: AbortSignal, stream: T): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## itowns: GlobeView.camera3D.projectionMatrix.toArray — identity

Review ID: 47ae3023f92b002d3b0bcecea90fd2092bd23656e840d0b466581d66bc0dd784
Candidate ID: 1ced1532079642670bd9b66e572abd4d65656b5b1c0ef6b47250e55b5fa66a3b
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/three/src/math/Matrix4.d.ts#L505
Source SHA-256: c6edcb1486e08b2fbbd82be383556f395b648aa12eb4b459d79cc1ae761c28c6
Binding: instance; kind: method

```ts
toArray<TArray extends ArrayLike<number> = Matrix4Tuple>(array?: TArray, offset?: number): TArray;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## anyproxy: ResponseDetail._res.req.pipe — identity

Review ID: c29a25686390259a0c2b4a79fbba43e8a3d6e3045231593b75c6cdd422eaeab4
Candidate ID: 09fbe4f9e14fd49440420a5f428cab753984831e01361f01d7c9f29bd954fc3f
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/stream.d.ts#L11
Source SHA-256: 5b26c4dd672d88336bb929787c9bfb55119e80ba89ec6dc923da1c063892843e
Binding: type-only; kind: method

```ts
pipe<T extends NodeJS.WritableStream>(
            destination: T,
            options?: Stream.PipeOptions,
        ): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## video.js: default.ChaptersButton.player_.liveTracker.addChild — identity

Review ID: 558e1ed9b2f429bcd48259ad31c26dfba259594bc03545e730938c6bff1f408a
Candidate ID: 7ab742443136190acf5f7a053b58fc86f38401e1ffd73aa2ed6cd7d98110fd30
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/video.js/index.d.ts#L1309
Source SHA-256: c6575c2574e63c9e213163468274981299be2c9d4b8b69f5204779eb82369fbb
Binding: type-only; kind: method

```ts
addChild<T extends Component>(child: string | T, options?: any, index?: number): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## restify-errors: ProxyAuthenticationRequiredError.SError.SError.errorFromList — container-element

Review ID: 75578e6d063ee49cfdc49cc069aa050663ae687212e3147d56a8fa78de1ccdfc
Candidate ID: b3fbbb9999cae937836e1ba03d92637364ec8fe1d5645e42676ffdf7298c5b11
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/verror/index.d.ts#L23
Source SHA-256: 62ba45a86b9a31eb84ea03ae0b9e800a507d980c1f38dcec6528f10078cfdedd
Binding: value; kind: method

```ts
static errorFromList<T extends Error>(errors: T[]): null | T | VError.MultiError;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## frctl__fractal: utils.defaultsDeep — container-element

Review ID: b53c146c84ac93a808c5c7d02aa6a6e821f1949d979b6549db5f5419ab8cdaf3
Candidate ID: 8ac801e4845274522d71328f6e86638f959126471d4cc4e50257b0f15e8c9bca
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/frctl__fractal/index.d.ts#L705
Source SHA-256: fc33537c4e24b87ebaa3b1580eb8e41775209ec234706f19353f719fb39535ee
Binding: value; kind: function

```ts
function defaultsDeep<T>(...args: T[]): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## numeric: min — container-element

Review ID: 47fe36a3fcd4c6bf22185783eab724b3bd38ae7786ad1adbf4762933ded54793
Candidate ID: bd0c1807c8eb0409b99f5c34dd9c8a6520f321fb80dbca5140b8e8212e7ec50d
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/numeric/index.d.ts#L869
Source SHA-256: f6c4772aef23c239ce16829815f8b4c35135a95ec603e3fdd02d67edb3f6f575
Binding: value; kind: method

```ts
min<T extends MultidimensionalMatrix>(
        x: T,
        y: T | Scalar,
        ...args: Array<Scalar | T>
    ): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## screeps-arena: AreaEffect.findClosestByPath — container-element

Review ID: 865f214ca70a06897d782aa84d746b8d622ed726170de2124bf0a7120b507015
Candidate ID: fcaa1be4856eaa112eb4996949f958394f463df3be2418dd35b5e18d34f31c2d
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/screeps-arena/game/prototypes/game-object.d.ts#L47
Source SHA-256: 2f041c95c402701aeea19368360a26a7a704cd0f792c10f29e4836c337542b7b
Binding: instance; kind: method

```ts
findClosestByPath<T extends Position>(positions: T[], options?: FindPathOptions): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## defined: (module export) — container-element

Review ID: 9b0d279d1f07d377bb00bccbe5ea837de6d5a6b00442da982b33d67c155f05e0
Candidate ID: e64c0b4a4a42d469b90eedf4a74d7f56a172eeac494054f1c1bc63bd35acfc98
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/defined/index.d.ts#L3
Source SHA-256: a2d6b4ba5cee04ed1532ff08dd8d051437747b7ac78462b4be32bfb6c657cfa3
Binding: value; kind: function

```ts
declare function defined<T>(...args: T[]): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## lodash: LoDashStatic.fill — value-to-container

Review ID: 033aed923bc6974ce00d3c26b49ac87d3ec72c3651b751835b0c6c1582077695
Candidate ID: 78f29c3efb5a3649ea4c671263f348c5c3227abc04031495b71b8954fc6c17b0
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/lodash/common/array.d.ts#L349
Source SHA-256: 40de86ced5175a6ffe84a52abe6ac59ac0efbc604a5975a8c6476c3ddc682ff1
Binding: type-only; kind: method

```ts
fill<T>(array: any[] | null | undefined, value: T): T[];
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## core-js: Array.fill — value-to-container

Review ID: 56bdb4bb77f931611e506f6ddc0bfc547765d02480ca8baa6f97a1819a2e081d
Candidate ID: bb5b1152ef918d71c053c273367a0766e258e89d67f2e0251a606c3ae2c4fc9a
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/core-js/index.d.ts#L818
Source SHA-256: 4598da29642d129e01fdf0c3a04eb70dc413ebfee21e35df8a9e8a567b060620
Binding: value; kind: method

```ts
fill<T>(array: ArrayLike<T>, value: T, start?: number, end?: number): T[];
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## prelude-ls: scanr — value-to-container

Review ID: f3b83a8c3d204eaef602a7812d11a542eaca5989878a02b272ab1f4c212e5847
Candidate ID: 99f684fc330d68eeb42430c74ff6bc7ed1b98ad16a01914ec08a10c588735ea8
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/prelude-ls/index.d.ts#L94
Source SHA-256: 3c0b63f579ac2d711ff2d74b3430791f8122648948945d628dfd57ed0342eca5
Binding: value; kind: function

```ts
export function scanr<A, B>(f: (x: A) => (y: B) => B, memo: B, xs: A[]): B[];
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## lodash: castArray — value-to-container

Review ID: e74876d987ec026a42c12bc11335fd42d0d5541708b450290398b181bb137e65
Candidate ID: 24cfdfea26e7507abd837f68acd796f918bc30da73db5b2bce20bbe3c0338ee6
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/lodash/common/lang.d.ts#L13
Source SHA-256: 5a0b15210129310cee9fa6af9200714bb4b12af4a04d890e15f34dbea1cf1852
Binding: value; kind: method

```ts
castArray<T>(value?: Many<T>): T[];
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## rax: RaxChildren.toArray — value-to-container

Review ID: 5f07f108fabef2d5fe49ea274f87506bd8f098441d3851263a46dfeab2a516f0
Candidate ID: 6cf2653e747892bf26a17cb2a40ee2c64c50433b5aa13012ba85612dd294eb1d
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/rax/index.d.ts#L2551
Source SHA-256: efb4a719e0f7cddb4aa3d166bc2e8f82b32fd1a0e631831204845d9c2781d0b4
Binding: type-only; kind: method

```ts
toArray<C>(children: C | C[]): C[];
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## rx-lite-experimental: SchedulerStatic.default.scheduleRecursiveWithAbsoluteAndState — multiple-arguments

Review ID: addb9982e00be4806077d5ceb8881d26b3e37e3d4b0370624615e77011907185
Candidate ID: 46ebb900ea7cbf3e75fff7bb622876de21b3517de18a2ec333c111906a646bd7
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/rx-lite/index.d.ts#L152
Source SHA-256: d49d881fd42b1bbf97e52e1045dab923ea8c899ea27734f1e565f9ac461b3e7f
Binding: type-only; kind: method

```ts
scheduleRecursiveWithAbsoluteAndState<TState>(
            state: TState,
            dueTime: number,
            action: (state: TState, action: (state: TState, dueTime: number) => void) => void,
        ): IDisposable;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## parse5-serializer-stream: prototype.reduce — multiple-arguments

Review ID: 5c4293cea93060b20b8fc235127ed2877bda2918e62691c8dbdc96e07bd99ddf
Candidate ID: 683f83740b012594cc066e8d840e32c469b60f26b6f7399664b8edcb387fd6f8
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/stream.d.ts#L632
Source SHA-256: 5b26c4dd672d88336bb929787c9bfb55119e80ba89ec6dc923da1c063892843e
Binding: value; kind: method

```ts
reduce<T>(
                fn: (previous: T, data: any, options?: Abortable) => T,
                initial: T,
                options?: Abortable,
            ): Promise<T>;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## rx-jquery: SchedulerStatic.timeout.scheduleRecursiveWithState — multiple-arguments

Review ID: 660d04e11afd959793ed020509dbd99fd2555e0faf6b642fe17659686399d410
Candidate ID: 365f6ec9adca0625a1e38f8980d34e9b7c880ec805b80a35a4151d2a5168df38
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/rx-lite/index.d.ts#L144
Source SHA-256: d49d881fd42b1bbf97e52e1045dab923ea8c899ea27734f1e565f9ac461b3e7f
Binding: type-only; kind: method

```ts
scheduleRecursiveWithState<TState>(
            state: TState,
            action: (state: TState, action: (state: TState) => void) => void,
        ): IDisposable;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## rx-jquery: Observable.generateWithRelativeTime — multiple-arguments

Review ID: bf2bd27eec4013cd71d6660ea05f705a6cb26c1e6a5e242dc9b95eb7cdfbadd4
Candidate ID: f1630f039596ac9c8167075a36cbd8fb315e0aab853e06e99fe2c9e302e2648d
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/rx-lite-time/index.d.ts#L45
Source SHA-256: 2c87e6b7b0156137f2d91d726d03f7f26984e79c9c1ab985ca1120d001eaf4a4
Binding: value; kind: method

```ts
generateWithRelativeTime<TState, TResult>(
            initialState: TState,
            condition: (state: TState) => boolean,
            iterate: (state: TState) => TState,
            resultSelector: (state: TState) => TResult,
            timeSelector: (state: TState) => number,
            scheduler?: IScheduler,
        ): Observable<TResult>;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## rx-lite-aggregates: Observable.reduce — multiple-arguments

Review ID: 59649bb1b26667238bf5efc1e6b023528536edf3e810ead942982c7e41d60549
Candidate ID: bf2c40f68c7864143154061c06491a96aa9c8a0267ee0e02466ae4c7a9636a23
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/rx-lite-aggregates/index.d.ts#L10
Source SHA-256: c83107db57871a34d2120485cbae16c92261860fafb23bcf1839df77c43aae26
Binding: type-only; kind: method

```ts
reduce<TAcc>(accumulator: (acc: TAcc, value: T) => TAcc, seed: TAcc): Observable<TAcc>;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## node: Readable.Stream.addAbortSignal — constrained-generic

Review ID: a103c4e9f14489bba68282e3f547f173980a86665a7c2c41824d8c450b21f529
Candidate ID: bec7225f00700abd40d5297f43fc3795965dab8a0d90d987ede667fcabf3d5f5
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/stream.d.ts#L1349
Source SHA-256: 5b26c4dd672d88336bb929787c9bfb55119e80ba89ec6dc923da1c063892843e
Binding: value; kind: method

```ts
function addAbortSignal<
            T extends NodeJS.ReadableStream | NodeJS.WritableStream | web.ReadableStream | web.WritableStream,
        >(signal: AbortSignal, stream: T): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## restify-errors: DefinedRestError.VError.errorFromList — constrained-generic

Review ID: 10aa6d9433bd18ab8cbba6c8ad5b285fb892c8ff9d3d46c4aaa99bc42488cb04
Candidate ID: 3480b99351b9224733eb2126037d578c3753574f585cac4d580863febb068375
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/verror/index.d.ts#L23
Source SHA-256: 62ba45a86b9a31eb84ea03ae0b9e800a507d980c1f38dcec6528f10078cfdedd
Binding: value; kind: method

```ts
static errorFromList<T extends Error>(errors: T[]): null | T | VError.MultiError;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## lodash: LoDashStatic.flow — constrained-generic

Review ID: a4c036bcb90ea50674cb7746b9d26573a9d3be8fb633ca66486c16ab0b50e2f9
Candidate ID: fdd06a28a5e7057f1a774299ab134050105de128772e9f22c732070cad0aba06
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/lodash/common/util.d.ts#L180
Source SHA-256: df996e25faa505f85aeb294d15ebe61b399cf1d1e49959cdfaf2cc0815c203f9
Binding: type-only; kind: method

```ts
flow<A extends any[], R1, R2, R3, R4, R5, R6, R7>(f1: (...args: A) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3, f4: (a: R3) => R4, f5: (a: R4) => R5, f6: (a: R5) => R6, f7: (a: R6) => R7, ...func: Array<Many<(a: any) => any>>): (...args: A) => any;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## express: request.pipe — constrained-generic

Review ID: 4b7d1480a163109bada3a5d77cce4a9fee9d59ad302dafad990ad7b5f8f2f971
Candidate ID: 6304d5fbd65fe5b93b1cda102b4f1b7846f433548f1c2c18203f6ce3bdb13e82
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/stream.d.ts#L11
Source SHA-256: 5b26c4dd672d88336bb929787c9bfb55119e80ba89ec6dc923da1c063892843e
Binding: value; kind: method

```ts
pipe<T extends NodeJS.WritableStream>(
            destination: T,
            options?: Stream.PipeOptions,
        ): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## jiff: clone — constrained-generic

Review ID: e1700e049d93c9efbf45e016e16033023023a0fd9ccd60f9c53bed656382a652
Candidate ID: 0f34722b07b3d18cdc81a474a1bc04c1a59fa1a4abe88826e0d3351fee3e42a2
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/jiff/index.d.ts#L39
Source SHA-256: 63fdbdab7b16410df103a9f186eddabd6cd853690607ca34c873944c2cab0892
Binding: value; kind: method

```ts
clone<T extends jiff.JSONValue>(x: T): T;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## rx-lite: Scheduler.default.schedulePeriodicWithState — higher-order

Review ID: 10a9ae08c4dde024426fdc50508383e41ecd1bd9e8bd468e8aa8e230c79769c8
Candidate ID: 3a2f092bb14a90b7183c7425c46fac626dda52c5989d3462b23d9d56ccd4aa4d
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/rx-lite/index.d.ts#L168
Source SHA-256: d49d881fd42b1bbf97e52e1045dab923ea8c899ea27734f1e565f9ac461b3e7f
Binding: value; kind: method

```ts
schedulePeriodicWithState<TState>(
            state: TState,
            period: number,
            action: (state: TState) => TState,
        ): IDisposable;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## rx-dom: SchedulerStatic.immediate.scheduleRecursiveWithAbsoluteAndState — higher-order

Review ID: 9506cb9f236d59fe2db1de0fb05b46ba4071764e3a43ddf34b586a95d987364b
Candidate ID: 7ce7ee375a61a00cbad0360b7258bd082b96bee5864c84eabe9771e8a62e7501
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/rx-lite/index.d.ts#L152
Source SHA-256: d49d881fd42b1bbf97e52e1045dab923ea8c899ea27734f1e565f9ac461b3e7f
Binding: type-only; kind: method

```ts
scheduleRecursiveWithAbsoluteAndState<TState>(
            state: TState,
            dueTime: number,
            action: (state: TState, action: (state: TState, dueTime: number) => void) => void,
        ): IDisposable;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## mz: fs.readv — higher-order

Review ID: 564772bb2d039f16069704741a606ce85c714a37036d411135d2d1b15687ca5e
Candidate ID: 3c33ec3077162295f0b4178a3182efc809645e1a78bd540cb319afbacde81b06
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/fs.d.ts#L4479
Source SHA-256: 9d37b8a9678efbcdf38238b59ce8e6f7db70aba1a516f3a4a671a301dbacfb3d
Binding: value; kind: function

```ts
function readv<TBuffers extends readonly NodeJS.ArrayBufferView[]>(
        fd: number,
        buffers: TBuffers,
        cb: (err: NodeJS.ErrnoException | null, bytesRead: number, buffers: TBuffers) => void,
    ): void;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## core-js: Array.turn — higher-order

Review ID: 30d61a642a4b5937597a6df3e70c697cfd33cf84c5bc7d617fd8f1efb1a7c318
Candidate ID: 358cc1b928b810cc90ad5375f6d2ef5f79f98294657099b93e02d952e82d2600
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/core-js/index.d.ts#L821
Source SHA-256: 4598da29642d129e01fdf0c3a04eb70dc413ebfee21e35df8a9e8a567b060620
Binding: value; kind: method

```ts
turn<T>(
            array: ArrayLike<T>,
            callbackfn: (memo: T[], value: T, index: number, array: T[]) => void,
            memo?: T[],
        ): T[];
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## multiplexjs: Enumerable.aggregate — higher-order

Review ID: 266366f79db51851ed42512fd8818189f6c0ed53d6fec093470a714c0b2659f5
Candidate ID: 31a789f5a684cecd156636cc6f2c906233f87f6ef29f462a774f19701608e368
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/multiplexjs/index.d.ts#L1348
Source SHA-256: 390579f9384d27b4b2ad1b584f391b33478d5ad781a94c72c6ed60302062f499
Binding: type-only; kind: method

```ts
aggregate<TAccumulate>(seed: TAccumulate, func: (accumulate: TAccumulate, item: T) => TAccumulate): TAccumulate;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## rx-lite-coincidence: GroupedObservable.publish — overload-or-discriminated

Review ID: 05e1ba5a3faa5df0fb5fea7bd4e0592889340e5ebf13f8e40c40c24d5c1297ee
Candidate ID: 69069e4b003fab69fa4c2327b387428fc57b015d516d2b236d9d3eb9a36eaa83
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/rx-core-binding/index.d.ts#L63
Source SHA-256: f2fd176887a12ed680f6e6748044cd7e56785920ff0e612a2ea18fab4c332e78
Binding: type-only; kind: method

```ts
publish(): ConnectableObservable<T>;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## node: EventEmitterAsyncResource.EventEmitterAsyncResource.EventEmitterAsyncResource.listenerCount — overload-or-discriminated

Review ID: 25cda06ba2195b383a41c846fc3482a3e3519279725e514243b8d813ac591495
Candidate ID: f379d11ffbd860f439c21c31d76739355f2b7d4ed87f9d9aa03a5a3facf84096
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/events.d.ts#L612
Source SHA-256: 8c7e618c2a91ea7f6b5cca272a295864e92c16413be8fc56a943e8c7d5320011
Binding: value; kind: method

```ts
function listenerCount(emitter: EventTarget, eventName: string): number;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## three: PointLightHelper.matrixWorld.makeTranslation — overload-or-discriminated

Review ID: 77b8e36ec54a1f1fe4d81e1c3a4b57e3da28aba56bb9acb528dbe110bb396a4f
Candidate ID: b2179e7535de50e5d13296d173f73c7cac84af450258ee3b3871dafdf3cc9592
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/three/src/math/Matrix4.d.ts#L346
Source SHA-256: c6edcb1486e08b2fbbd82be383556f395b648aa12eb4b459d79cc1ae761c28c6
Binding: instance; kind: method

```ts
makeTranslation(v: Vector3): this;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## openui5: default.attachEventOnce — overload-or-discriminated

Review ID: d9f7d48d2fecdceddd0964955cdd9162e9f97cc462a7c3644cefbdd2dda52340
Candidate ID: cadf5d4e9e7316349cc4c6c245e359419001b4f11f4551978fd9fac764a14781
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/openui5/sap.ui.core.d.ts#L12379
Source SHA-256: 1c3133c132b5758930f6112defed4eb268ba7e5c112a135da54a6833ef10c422
Binding: instance; kind: method

```ts
attachEventOnce(
      /**
       * The identifier of the event to listen for
       */
      sEventId: string,
      /**
       * The handler function to call when the event occurs. This function will be called in the context of the
       * `oListener` instance (if present) or on the event provider instance. The event object ({@link sap.ui.base.Event})
       * is provided as first argument of the handler. Handlers must not change the content of the event. The
       * second argument is the specified `oData` instance (if present).
       */
      fnFunction: Function,
      /**
       * The object that wants to be notified when the event occurs (`this` context within the handler function).
       * If it is not specified, the handler function is called in the context of the event provider.
       */
      oListener?: object
    ): this;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## video.js: default.TextTrackMenuItem.player_.player_.width — overload-or-discriminated

Review ID: c9efc096f2afd365b3c129e806de7d98ad534273d3d7827c311cff45f945f8b5
Candidate ID: 1618120cd43aa1b029d57ee5a4d5f8d0d2695fab69334fdf42200078096ac8ed
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/video.js/index.d.ts#L7208
Source SHA-256: c6575c2574e63c9e213163468274981299be2c9d4b8b69f5204779eb82369fbb
Binding: type-only; kind: method

```ts
width(): number;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## node: Gzip.PassThrough.Transform.compose — unsupported

Review ID: 667993cac529fd57b9f0231163bacedd4abba52c4afb912c6df624e316d3803b
Candidate ID: c4feadee7777209a3e17e9dbce41b8acb408ef2d013def612b78f79e5971f385
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/stream.d.ts#L1741
Source SHA-256: 5b26c4dd672d88336bb929787c9bfb55119e80ba89ec6dc923da1c063892843e
Binding: value; kind: method

```ts
function compose(
            ...streams: [
                ComposeSource<any>,
                ...ComposeTransform<any, any>[],
                ComposeDestination<any>,
            ]
        ): Duplex;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## bitcore-lib: HDPublicKey.fingerPrint.swap16 — unsupported

Review ID: a978b8db510941fdea639b60c2617fb2cba2753f6a59d7dc29a2f00c57e2b504
Candidate ID: 2d042a1a942e0265c7bfde6855e09e68c2570d406211d093bbf0282ab2942754
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/node/buffer.d.ts#L1102
Source SHA-256: 575aa163c4c32e5b82e0e99b1f9f80806e1d78bfa259706e05139251c022277b
Binding: instance; kind: method

```ts
swap16(): this;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## lodash-es: reduce — unsupported

Review ID: 3a5d6d3baea6aedf84b72f05376e48c054954e20e334e7be36c651d4ca869589
Candidate ID: 8f9bd4ebef4b8643ff2322b63ba3f441896819c3a96411c2bd8e015932077e74
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/lodash/common/collection.d.ts#L1455
Source SHA-256: fcf79300e5257a23ed3bacaa6861d7c645139c6f7ece134d15e6669447e5e6db
Binding: value; kind: function

```ts
reduce<T, TResult>(collection: List<T> | null | undefined, callback: MemoListIterator<T, TResult, List<T>>, accumulator: TResult): TResult;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## blessed: Widgets.ListTableElement.screen.focused.removeLabel — unsupported

Review ID: e120340f26d3fe390a82de31e828ea7c193ee1bff4c900d30cef6e483bd6b1df
Candidate ID: cf2281fce68b8ca9bcb533596bc604403e10118f5b029ae40ad973dc857b6c31
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/blessed/index.d.ts#L1888
Source SHA-256: a4cb76c6f4b8356d14d6cf5c05e1e3fbc74007b160a00f6511a8c39295f08c42
Binding: instance; kind: method

```ts
removeLabel(): any;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:

## openui5: default.setBusyIndicatorDelay — unsupported

Review ID: d0237726094a8d4e3eb6e7cc8241837a8e4181d56db8b0fe88435bdfdbe9288e
Candidate ID: 233860921141fe3fdfe45680068900f5cb4577af431bd6e746201c8a3a180a5d
Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/455254aa7204192e7f7fbe50266d2313cefdf6c9/types/openui5/sap.ui.core.d.ts#L23105
Source SHA-256: 1c3133c132b5758930f6112defed4eb268ba7e5c112a135da54a6833ef10c422
Binding: instance; kind: method

```ts
setBusyIndicatorDelay(
      /**
       * The delay in ms
       */
      iDelay: int
    ): this;
```

### Q1: Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?

Answer and evidence:

### Q2: Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.

Answer and evidence:

### Q3: Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?

Answer and evidence:

### Q4: For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?

Answer and evidence:

### Q5: Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.

Answer and evidence:

### Q6: Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?

Answer and evidence:

### Q7: Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.

Answer and evidence:

### Q8: Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.

Answer and evidence:

### Q9: What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.

Answer and evidence:

### Q10: Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.

Answer and evidence:

Final verdict (agree / false-classification / ambiguous / excluded):
Confidence (high / medium / low):
Rationale, corrections and unresolved blockers:
