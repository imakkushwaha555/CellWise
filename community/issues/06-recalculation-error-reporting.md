# Draft: Improve formula error details during recalculation

**Suggested labels:** `help wanted`, `enhancement`

## Problem

During a recalculation pass, intermediate dependency errors are intentionally deferred and final errors are reported in the status area. Users may benefit from clearer, cell-specific explanations.

## Acceptance criteria

- Preserve the existing behavior that failed apply operations do not overwrite a cell with a result.
- For recalculation, report the cell address and formula error clearly.
- Keep any new error text safe for Word content controls.
- Add mock tests for a failed formula and a dependent formula.

## Validation

Run `npm run test` and `npm run typecheck`; live Word behavior remains unverified.
