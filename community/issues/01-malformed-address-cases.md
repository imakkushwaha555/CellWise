# Draft: Add table-driven tests for malformed A1 addresses

**Suggested labels:** `good first issue`, `testing`

## Problem

The formula engine has tests for several valid addresses and one invalid row number. More malformed inputs should be covered so future tokenizer changes do not accidentally accept partial or ambiguous references.

## Acceptance criteria

- Add focused tests for zero/leading-zero rows, missing row numbers, punctuation, and trailing letters.
- Verify that valid multi-letter columns remain accepted.
- Keep error assertions specific to invalid-address errors without matching full wording.
- No runtime behavior changes unless a test demonstrates a defect.

## Validation

Run `npm run test` and `npm run typecheck`.
