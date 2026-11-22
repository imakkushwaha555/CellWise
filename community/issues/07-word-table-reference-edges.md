# Draft: Document and test A1 addressing edge cases in Word tables

**Suggested labels:** `good first issue`, `documentation`, `testing`

## Problem

Cellwise maps coordinates to table row and cell indexes. Header rows, empty rows, irregular tables, and merged cells should be tested in real Word before their behavior is described as supported.

## Acceptance criteria

- Add a manual test matrix with synthetic tables only.
- Record behavior for header rows, irregular rows, and merged cells.
- Update docs to state verified behavior and unsupported cases.
- Do not claim merged-cell support unless a live test confirms it.
