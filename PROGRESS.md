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
    - replaced placeholder `<Id>` GUID with a fresh GUID: `e1f74c30-625a-4135-9f0a-4dd06dfb1240`,
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
- **Tested:** recursive working-tree search found no legacy product-name references in source, manifest, or package metadata.
- **Unverified:** Live desktop/web host behavior. See `TESTING.md` for manual steps and expected results.
- **Not present:** No zip/archive existed in the repository to rename; release archive naming is deferred to Phase C.
- **Resolved:** The workspace was later reopened from its renamed `cellwise` directory. No force or delayed rename was attempted.
- **Next:** Continue the existing Phase B Word integration work.

## Phase B: Word integration verification

- **Verified:** Formula and mock-client tests, strict TypeScript type-check, add-in build, and manifest validation pass.
- **Implemented in the worktree:** A mock Word client, formula-application/recalculation regression coverage, and mock `#ERR` behavior.
- **Unverified:** Live Word sideload and document behavior; see `TESTING.md`.
- **Status:** Step 2 changes are committed locally; live Word behavior remains unverified.
- **Local commit:** `c25b6d7` (`fix: integrate Word formulas through testable client`).

## Phase D: Installer prototype

- **Implemented:** Added `npm run package`, an NSIS per-user EXE, a hosted-manifest ZIP, and
  `scripts/Verify-Cellwise.ps1`. The EXE asks for an existing writable UNC catalog, registers
  `HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs`, and includes an MIT license page,
  disclaimer, no-telemetry statement, and silent-mode support.
- **Verified locally:** `npm run package` completed using a synthetic GitHub Pages URL. The ZIP
  entries, generated manifest URLs, and EXE version metadata were inspected. The generated hosted
  manifest also passed `office-addin-manifest validate`. The compiler reported NSIS 3.13 and zlib
  compression. Synthetic-host EXE/ZIP artifacts were removed after each smoke test.
- **Verified:** `npm run test`, `npm run typecheck`, `npm run validate`, `npm run package` with
  synthetic URLs, and `git diff --check` pass. The generated package is only a smoke test; no
  real-host installer has been produced.
- **Not a production installer:** Microsoft's network-share catalog method is documented as
  testing-only. The installer's required UNC share must already exist and may require separate
  Windows sharing permissions. The installer does not create shares, alter firewall settings,
  trust certificates, or create scheduled tasks.
- **No final installer artifact:** No remote or real GitHub Pages owner is configured. The
  localhost source manifest remains unchanged; packaging requires real `CELLWISE_BASE_URL` and
  `CELLWISE_REPOSITORY_URL` values.
- **Not tested:** Install/upgrade/repair/uninstall in Word or a clean Windows VM; documented
  expected steps are in `INSTALLER_TESTING.md`. No signing application or setup exists.
- **Researched:** SignPath Foundation advertises free signing for eligible OSS projects with a
  published code-signing policy, MFA, defined signing roles, and manual approval per release.
  Application/acceptance and SmartScreen behavior remain unverified; see
  [INSTALLER_TESTING.md](INSTALLER_TESTING.md).
- **Deferred:** MSI, per the user's choice. WiX has MS-RL source licensing and a maintenance-fee
  condition for revenue-generating use; it conflicts with the no-paid-tool and default permissive
  license requirements.
- **Version conflict resolved:** At the user's direction, `package.json` and the lockfile are now
  `1.0.0`, matching manifest `1.0.0.0` at the SemVer level. The generated NSIS executable has
  numeric version metadata `1.0.0.0` and displays file/product version `1.0.0`. The prospective
  release tag is `v1.0.0`; no tag has been created.
- **Registration scope:** The user confirmed the UNC catalog route is testing-only. Do not present
  the prototype as a production-ready standalone installer.
- **Remaining blockers:** The GitHub repository has not been created, so there is no remote or real
  Pages URL. Windows VM/live Word installation and installer runtime behavior remain unverified.
  `AGENT_BRIEF.md` is absent; project rules were read from `AGENTS.md`, `.ai/instructions.txt`,
  and available project documentation.

## Phase E: Release engineering (prepared, not CI-verified)

- **Implemented:** Added a tag-triggered Windows release workflow with pinned action SHAs and
  checked PowerShell/Node.js/npm/Chocolatey/NSIS/GitHub CLI versions. It runs tests, type checking,
  manifest validation, version consistency, `npm audit --audit-level=high`, packaging, host availability,
  CycloneDX SBOM generation, an allowlist-based dependency license gate, SHA-256 checksums, and
  GitHub build-provenance attestations before creating a release.
- **Implemented:** Added `CHANGELOG.md`, `RELEASE_NOTES_TEMPLATE.md`, and scripts for version,
  hosting, and license checks. The license gate was exercised against the current SBOM (51
  dependency components) and a negative GPL test; it passed.
- **Verified locally:** `npm run test`, `npm run typecheck`, `npm run validate`,
  `node scripts/check-version.mjs`, npm SBOM/license validation, `npm audit --audit-level=high`,
  and `npm run package` passed. The audit reports one existing **moderate** esbuild advisory;
  no High/Critical advisory was reported. NSIS built the installer after the uninstall warning
  fix; generated artifacts were deleted.
- **Unverified:** GitHub Actions, GitHub Release, attestation publication, NSIS installation on the
  hosted runner, and live Pages host checks cannot run until the repository exists. The workflow
  intentionally refuses to release if hosted taskpane resources are unavailable or the tag does
  not match `package.json`.
- **Deferred:** MSI remains deferred. No tag, remote, release, or deployment was created.

## Phase F: Discoverability and documentation

- **Implemented locally:** Reworked the README, added a plain HTML/CSS Pages site and tutorials,
  original social-preview and formula illustrations, SEO metadata, sitemap/robots files, community
  and contribution templates, issue/outreach drafts, distribution templates, citation guidance,
  and CI/Pages workflows. No GitHub repository settings, issues, labels, Discussions, or submissions
  were changed or created.
- **Accuracy correction:** Microsoft's built-in Word formula field already accepts spreadsheet-style
  references and positional formulas. README and site comparison text now describe Cellwise as a
  separate task-pane workflow, not the only way to use A1 references.
- **Verified locally:** `npm run test`, `npm run typecheck`, `npm run validate`,
  `node scripts/check-version.mjs`, and `npm run pages:build` with synthetic HTTPS URLs passed.
  The license gate passed for 51 SBOM components. `npm audit --audit-level=high` exited successfully;
  one moderate esbuild advisory remains. The social preview is 1280 x 640.
- **Visual QA:** A local documentation walkthrough navigated the landing page, sum tutorial,
  A1-addressing guide, and formula comparison page. It is not a live Word demo.
- **Unverified:** GitHub CI, Pages deployment, live Word, clean Windows VM installation, and release
  attestations have not run. Repository owner values remain placeholders. No commit was made.

## Phase G: Release gate preparation

- **Checklist:** Added `RELEASE_CHECKLIST.md` with automated, agent-verified, and needs-human
  evidence. The release is not ready: no Git remote, owner URL, tag, or release exists; MSI remains
  deferred; and the UNC-catalog installer is testing-only.
- **History cleanup:** With the user's approval, rewrote all local refs using the verified
  `git-filter-repo` 2.47.0 tool. Gitleaks 8.30.1 (MIT; release digest verified) found no secrets
  across all 20 refs covering 43 unique reachable commits, or in the current worktree. A separate
  scan found no personal-path matches in reachable history or project files. Commit IDs changed.
  Three pre-rewrite recovery bundles remain outside the repository and must not be published.
- **Validation after rewrite:** `npm run test`, `npm run typecheck`, `npm run validate`,
  `node scripts/check-version.mjs`, `npm run pages:build` with synthetic HTTPS URLs, and
  `git diff --check` passed.
- **Next:** Confirm repository ownership and URLs, obtain human live Word/Windows VM validation,
  and resolve the MSI/production-installation blockers. Wait for the exact `approve release`
  instruction before any push, tag publication, Pages deployment, or GitHub release.
