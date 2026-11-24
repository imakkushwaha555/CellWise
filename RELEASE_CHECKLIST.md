# Cellwise v1.0.0 release checklist

**Status: NOT READY — local preparation only.** No remote, public repository, tag, GitHub release,
or Pages deployment exists. The user must give the exact `approve release` instruction before
publishing or deploying anything.

## Automated — locally run

- [x] `npm run test` — formula, Word mock, dependency-license, version, and Pages metadata tests
  passed.
- [x] `npm run typecheck` — passed.
- [x] `npm run validate` — the development manifest passed validation. It still uses localhost URLs;
  this is not production-host validation.
- [x] `node scripts/check-version.mjs` — package `1.0.0`, manifest and installer numeric version
  `1.0.0.0` agree. The intended tag is `v1.0.0`.
- [x] `npm run pages:build` — passed with synthetic `cellwise-ci` HTTPS URLs. This is a local build,
  not a live Pages deployment.
- [x] CycloneDX SBOM license gate — passed for 51 components; every declared license was in the
  project's permissive allowlist.
- [x] `npm audit --audit-level=high` — exited successfully. One **moderate** esbuild advisory
  remains; npm reports that the available fix is a breaking upgrade. No High/Critical advisory was
  reported by this command.
- [x] `git diff --check` — passed during local documentation work.
- [x] Gitleaks 8.30.1 — no secrets reported when each of the 20 local refs was scanned separately,
  covering all 43 unique reachable commits, or in the current worktree. The official release asset
  SHA-256 was verified before running the scan.
- [x] Personal-path scan — no matches in all reachable local refs or project files after the
  user-approved local history rewrite. Commit IDs changed; three pre-rewrite recovery bundles remain
  outside the repository and must not be published.

These are local results, not GitHub Actions evidence. CI, release packaging on a hosted runner,
artifact attestations, and a live Pages URL have not been tested.

## Agent-verified — local inspection

- [x] The site has five static content pages, per-page SEO metadata, JSON-LD, a sitemap, robots
  rules, mobile styles, and the required non-affiliation disclaimer.
- [x] A 15.68-second local documentation walkthrough covered the landing page, a sum tutorial,
  A1-addressing examples, and the formula comparison. It does not show Word or claim a live
  calculation.
- [x] The README and site accurately acknowledge Word's built-in spreadsheet-style formula
  references and distinguish Cellwise's task-pane workflow.
- [x] The package/installer smoke test used synthetic hosting URLs; its generated artifacts were
  removed. No real-host EXE or install ZIP is available.
- [x] No Git remote, release tag, or public deployment is configured.
- [x] Rewrote unpublished local history with the user's approval. Gitleaks scanned every ref
  separately; the combined path scan covered all 43 unique reachable commits. Both scans were clean.

## Needs human — blocking

- [ ] Confirm the GitHub repository owner and URL. Replace `OWNER` and author placeholders in
  metadata, README badges, and manifest support links. The repository and owner-specific URLs are
  not confirmed.
- [ ] Test in live Word and a clean Windows VM: sideload, formula entry/recalculation, install,
  upgrade, repair, uninstall, registry cleanup, and absence of residual files, certificates, or
  scheduled tasks. These tests have not been run.
- [ ] Decide whether to proceed without an MSI. MSI is deferred; no MSI artifact exists. The NSIS
  installer is a testing prototype using Microsoft's testing-only UNC trusted-catalog route, not a
  production no-admin installer.
- [ ] Review unsigned-installer SmartScreen behavior and, if eligible, evaluate the SignPath
  Foundation application process. No signing account, certificate, or signed artifact exists.
- [ ] Configure repository settings, Pages, Discussions, topics, social preview, and branch
  protection with the owner. None have been configured.
- [ ] After all blockers are resolved, provide the exact `approve release` instruction before any
  push, tag publication, GitHub release, Pages deployment, or repository-setting changes.

## Release evidence still unavailable

- No MSI; no production-ready personal installer route has been verified.
- No live Word or Windows VM test evidence.
- No GitHub Actions run, hosted artifact, published checksum/SBOM, or attestation.
- No confirmed Git remote, tag, Pages URL, or GitHub release.
