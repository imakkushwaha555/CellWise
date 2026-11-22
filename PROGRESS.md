# Progress Log

## Step 1: Environment and verification

### Status after this session

- Repo classified as an existing scaffolded project (v0.1); Git metadata is present.

- **Done (verified by actually running the commands):**
  - `npm install` completed (added dev deps: `office-addin-manifest`, `@types/node`).
  - `npm run test` passes (formula engine: 8/8 checks).
  - `npm run build` now runs via `scripts/build.mjs` (cross-platform, replaces `cp`); generates
    `dist/taskpane.js`, copies `taskpane.html`, and writes placeholder `dist/icon-16.png`, `dist/icon-32.png`,
    `dist/icon-80.png` (original procedural placeholder artwork).
  - `npx tsc --noEmit` now passes after tsconfig fix (added `allowImportingTsExtensions`, `noEmit`, `skipLibCheck`,
    `types: ["office-js","node"]`).
  - `npm run validate` added (`npx office-addin-manifest validate manifest.xml`); **passes** (exit 0) after:
    - bumped `<Version>` from `0.1.0.0` -> `1.0.0.0` (schema required >= 1.0),
    - replaced placeholder `<Id>` GUID with a fresh GUID: `73fd4aa1-b386-4bb7-8df9-e2c09777b1ed`,
    - added missing `<Icon>` child element to the `<Group>` in the taskpane overrides.
  - `scripts/serve.mjs` created to use cross-platform `os.homedir()` for cert paths.

- **Known gaps / not done yet (Step 1):**
  - `npm run certs` has NOT been run in this session; cert directory absent
    (`%USERPROFILE%\.office-addin-dev-certs` does not exist yet).
  - Could NOT be verified in a live Word instance (no Word here). Manual checklist written to `TESTING.md`.
  - `npm audit` still reports 1 moderate vulnerability (pre-existing, unrelated to this work).

- **Next:** proceed to Step 2 (Word integration correctness / mock Word layer) once Step 1 checklist fully closed.

## Phase A: Rename to Cellwise

- **Status:** Rename/addressing work committed as `498c460` (`chore: rename project to Cellwise`).
- Updated package metadata, lockfile root name, add-in manifest, task-pane title/heading/footer,
  README, legal notes, testing notes, and source formula description.
- Added the original SVG logo and build-generated 16/32/80 px PNG icons in `assets/`.
- Added `parseAddress` and test assertions for A1, B3, AA1, and AB1 round trips.
- **Tested:** `npm run test` passed, including formula and mock-client tests and all four A1-address round trips.
- **Tested:** `npm run build` passed; generated icon files are 16x16, 32x32, and 80x80 pixels.
- **Tested:** `npm run validate` passed against the updated manifest.
- **Tested:** `node .\\node_modules\\typescript\\bin\\tsc --noEmit` passed.
- **Tested:** recursive working-tree search for `table formulas` and `word-table-formulas` found no matches.
- **Unverified:** Live desktop/web host behavior. See `TESTING.md` for manual steps and expected results.
- **Not present:** No zip/archive existed in the repository to rename; release archive naming is deferred to Phase C.
- **Blocked:** Renaming `%WORKSPACE%