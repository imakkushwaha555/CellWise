# Draft: Validate formula application in live Word hosts

**Suggested labels:** `help wanted`, `testing`

## Problem

The Office.js integration has mock tests, but no live Word desktop or web session has verified table selection, content-control insertion, or recalculation.

## Acceptance criteria

- Record exact Word host, platform, and version.
- Use a synthetic document with simple arithmetic, a range, an empty cell, and a formula error.
- Verify apply, edit, recalculate, and save/reopen behavior.
- Report results without uploading the test document or private logs.

## Validation

Follow `TESTING.md`; mark every host not actually tested as unverified.
