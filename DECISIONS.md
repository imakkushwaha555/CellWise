# Decisions Log

## Phase A: Rename to Cellwise

- **Decision:** Rename the product, npm package, manifest display name, task pane, and user-facing
  documentation to Cellwise.
- **Rationale:** Establish the requested distinct product identity while keeping host references
  descriptive and pairing them with the required disclaimer.
- **Repository metadata:** The repository URL, support URL, and author are explicit placeholders
  (`OWNER` / `Your Name`) because no Git remote or owner identity is configured. Replace them
  before publication.
- **Manifest identifier:** Generated a new UUID for this add-in manifest.
- **Artwork:** Added an original grid logo and procedural raster icons using a purple, mint, and
  amber palette. No Microsoft assets or icon library were used.
- **Address parsing:** Added strict A1 `parseAddress` conversion to zero-based row/column indices
  and round-trip tests for A1, B3, AA1, and AB1.
- **Root folder/archive:** The requested root-folder rename was attempted after the Phase A commit,
  but Windows reported the directory was in use. The workspace was later reopened as `cellwise`.
  No forced or delayed rename was attempted. No zip/archive existed in the repository to rename;
  release archive naming remains for Phase C.

## Step 1: Environment and verification

### Build script migration (Node.js instead of shell commands)
- **Decision:** Replaced cross-platform incompatible shell commands (`cp`) with Node.js scripts
  (`scripts/build.mjs`, `scripts/serve.mjs`). Node.js is guaranteed available when npm runs.
- **Rationale:** `cp` fails on Windows; Windows/macOS/Linux all need `npm run build` to work.
- **Trade-off:** Adds a `scripts/` directory but keeps everything in the repo and requires no
  external dependencies.

### Icon generation (procedural, original artwork)
- **Decision:** Icons `icon-16.png`, `icon-32.png`, `icon-80.png` are generated procedurally in
  `scripts/build.mjs` using a CRC32 + zlib deflate PNG encoder (no external image libs).
- **Rationale:** Need placeholder icons in `dist/` for the add-in manifest; original artwork
  avoids any copyright/licensing concern (Hard Constraint 3).
- **Trade-off:** Simple placeholder (solid blue gradient + white square + blue inner square), not
  a polished final icon. Final icons are a Step 7 deliverable (AppSource submission).
- **Note:** These are placeholder icons and do NOT resemble or copy Microsoft assets.

### Manifest version bump
- **Decision:** `<Version>` raised from `0.1.0.0` to `1.0.0.0`.
- **Rationale:** `office-addin-manifest validate` rejected versions < 1.0 (schema requires >= 1.0).
- **Trade-off:** Changes semantic versioning intent but required for validation to pass.

### Placeholder GUID replacement
- **Decision:** Replaced placeholder `new-guid-here` / old fixed GUID with a freshly generated
  UUID: `e1f74c30-625a-4135-9f0a-4dd06dfb1240`.
- **Rationale:** Requirement: "Replace the placeholder GUID." Also the old GUID was fixed/inherited
  from scaffold; a fresh UUID avoids collisions with other add-ins.
- **Trade-off:** None; required for validation to pass.

### Manifest `Group` element needs `<Icon>`
- **Decision:** Added an `<Icon>` child (containing `bt:Image` refs) to the `<Group id="G">`
  inside `VersionOverrides`.
- **Rationale:** The `office-addin-manifest` schema validator requires the `Group` to declare an
  icon in addition to the `Control` inside it. Without it, schema validation failed with:
  "The element 'Group' has invalid child element 'Control'; expected 'Icon'".
- **Trade-off:** Minor manifest structure change; does not affect add-in behavior.

### Serve script uses `os.homedir()`
- **Decision:** `scripts/serve.mjs` computes cert paths from `os.homedir()` instead of
  `%USERPROFILE%` environment variable.
- **Rationale:** `%USERPROFILE%` is Windows-specific; macOS/Linux use `$HOME`. Cross-platform
  requirement in Step 1.
- **Trade-off:** None; `os.homedir()` works on all platforms.

### TypeScript tsconfig fix
- **Decision:** Added `allowImportingTsExtensions: true`, `noEmit: true`, `skipLibCheck: true`, and
  `types: ["office-js","node"]` to `tsconfig.json`.
- **Rationale:** `formula.test.ts` imports with `.ts` extension (Node's `--experimental-strip-types`
  requires it); TypeScript needs `allowImportingTsExtensions` for that. `noEmit` avoids conflicts
  with esbuild's bundling. `node` types needed for `process.exitCode`.
- **Trade-off:** None; this is standard for projects using esbuild + ts-node.

### Office Add-in manifest dev dependency
- **Decision:** Added `office-addin-manifest` as a dev dependency for the `validate` script.
- **Rationale:** Requirement: "Add `npm run validate` using `office-addin-manifest validate`."
- **License:** MIT (verified by Microsoft; package `license` field is `MIT`).
- **Trade-off:** Adds `node_modules` size (~50 packages); all dev-only, no runtime impact.

### @types/node dev dependency
- **Decision:** Added `@types/node` as a dev dependency for TypeScript type checking.
- **Rationale:** Needed for `process.exitCode` in `formula.test.ts` type checking.
- **License:** MIT (verified; `@types/node` is MIT).
- **Trade-off:** None.

### Unknown security vulnerability
- **Decision:** `npm audit` reports 1 moderate severity vulnerability (in an esbuild sub-dependency
  chain). Not blocking; documented as a known issue.
- **Rationale:** Pre-existing from scaffold dependencies; fixing would require upgrading esbuild
  (not in scope for Step 1).
- **Next:** Reassess during Step 6 (Quality) with `npm audit`.

## Untested / Unverified

- Live Word integration (`taskpane.ts`) has NOT been run against a real Word instance.
  This is why `TESTING.md` was created (manual checklist).
- `npm run certs` has not been executed in this session (requires user interaction).

## Note on manifest production validation

- `npx office-addin-manifest validate manifest.xml -p` (production flag) produces additional
  errors about `localhost` URLs and unreachable support URL. These are expected for a
  **dev/sideload** manifest; production submission will require a real HTTPS host and a
  reachable support URL. The npm `validate` script intentionally uses the non-production
  invocation so CI can validate the sideload manifest. Production validation is deferred to
  Step 7 (Release readiness) where a real deployment domain is available.

## License compliance

- `office-addin-manifest` (MIT) and `@types/node` (MIT) added as devDependencies.
- No third-party runtime dependencies added.
- Original code only for the formula engine and build scripts.

## Phase D: Installer and deployment research

- **Current add-in build:** `npm run build` and `npm run validate` pass. The checked-in manifest
  still targets `https://localhost:3000`; the output is a development build, not a standalone
  installable package.
- **Hosting direction:** GitHub Pages is the preferred static host from the release brief. This
  would download the add-in's HTML/JavaScript, but the current application evaluates formulas
  locally and has no code path that sends document contents to that host. Publishing or enabling
  Pages is deferred until the repository is identified and the release gate is approved.
- **Windows registration constraint:** Microsoft documents the
  `HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs` registry catalog for a network share,
  with `Url` set to a UNC folder. Microsoft explicitly labels network-share deployment as testing
  only and not supported for production. The reviewed documentation does not describe registering
  a GitHub Pages manifest or a per-user local folder as this catalog.
- **Other documented deployment methods:** Microsoft 365 Integrated Apps/Centralized Deployment
  requires an organization administrator. SharePoint catalog limitations include lack of support
  for `VersionOverrides`, which this add-in uses. These methods do not provide a verified,
  no-admin, stand-alone desktop install for this manifest.
- **Registration scope:** The user confirmed the existing writable UNC trusted catalog is for
  testing only. No local-folder registry behavior is used, and this route must not be presented as
  a production deployment method.
- **Installer toolchain:** User selected deferring MSI. WiX's published terms include MS-RL for
  its source and an Open Source Maintenance Fee for revenue-generating use of its releases, which
  conflicts with the project's default license policy and the no-paid-tools requirement. NSIS
  3.13 was verified locally. The installer explicitly uses the zlib compressor; the NSIS build
  output confirmed zlib compression. No packaging dependency was added.
- **Package prototype:** `npm run package` successfully generated a ZIP and EXE using a synthetic
  GitHub Pages URL for smoke testing. The contents and Windows file/product versions were
  inspected, then the fake-host artifacts were removed. This is not a distributable package.
- **Version strategy:** At the user's direction, aligned `package.json` and `package-lock.json`
  to `1.0.0`, matching the Office manifest `1.0.0.0` at the SemVer level. NSIS uses numeric
  executable version metadata `1.0.0.0` and displays file/product version `1.0.0` (verified in
  the generated EXE). The eventual release tag would be `v1.0.0`; no tag has been created.
- **Signing research:** SignPath Foundation advertises free OSS signing, but requires an eligible
  released and actively maintained project, clear ownership, MFA, defined author/reviewer/approver
  roles, a published code-signing policy, and manual approval for each release. The certificate is
  issued in the Foundation's name, not the project's. Eligibility and SmartScreen outcome are not
  guaranteed; Cellwise has not applied. See [INSTALLER_TESTING.md](INSTALLER_TESTING.md).
- **Remaining:** The GitHub repository has not been created, so no remote or Pages URL exists.
  Windows VM/live Word install and installer runtime behavior remain unverified.
- **Option 2:** Not selected. A local HTTPS server and locally trusted certificate add certificate
  trust and lifecycle risks; do not implement without a reviewed, user-approved design.

## Phase E: Release engineering

- **Release version:** User selected `1.0.0`, matching Office manifest `1.0.0.0` and installer
  numeric version `1.0.0.0`; eventual tag is `v1.0.0`.
- **MSI:** Deferred at the user's direction; the release workflow will produce the ZIP and NSIS EXE
  only. No WiX tooling is added.
- **CI:** Use GitHub-hosted `windows-2025`, PowerShell 7.6.10, Node.js 24.20.0, npm 11.19.0,
  Chocolatey 2.7.5, NSIS 3.13.0, and GitHub CLI 2.104.0, with exact runtime checks. GitHub
  Actions are pinned to commit SHAs in the workflow.
- **SBOM/license gate:** Use npm's built-in CycloneDX SBOM generator, then fail on missing,
  unknown, or non-allowlisted dependency licenses. The current locked graph reports permissive
  licenses only; the two Blue Oak Model License dependencies were checked against the publisher's
  published license. No new package dependency was introduced for SBOM or license analysis.
- **Provenance:** Use GitHub artifact attestations with `id-token: write` and
  `attestations: write`; preserve the Sigstore bundle alongside the release assets.
- **Unverified:** The GitHub repository does not exist yet, so the workflow, release API, Pages
  URL, and runner package installation have not run in CI.
- **Sources:** [npm SBOM documentation](https://docs.npmjs.com/cli/v11/commands/npm-sbom),
  [GitHub artifact attestations](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations),
  [Windows 2025 runner image](https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-Readme.md),
  and [NSIS 3.13 download](https://nsis.sourceforge.io/Download).

## Phase F: Discoverability and documentation (prepared, not published)

- **Product comparison:** Microsoft's official Word `Selection.InsertFormula` reference says that
  Word's built-in formula field accepts spreadsheet-style table-cell references (for example
  `=SUM(A4:C4)`) and can use positional expressions such as `SUM(ABOVE)` or `SUM(LEFT)`. The
  discovery brief's implication that Word requires helper A/B/C and 1/2/3 labels is not accurate
  for explicitly referenced formulas. README and site copy describe Cellwise as a separate
  task-pane workflow, not as the only way to use A1 references.
- **Source:** https://learn.microsoft.com/en-us/office/vba/api/word.selection.insertformula
- **Static docs:** Chose plain HTML/CSS and Node built-ins; no framework or dependency was added.
  The Pages build emits five SEO-described HTML pages, JSON-LD, sitemap, robots rules, and the
  built task-pane files. It requires a real `cellwise` GitHub owner URL and refuses to replace an
  unmarked `_site` directory. Only a synthetic owner was used in local validation.
- **Privacy and hosting:** GitHub Pages is prepared but not enabled. It will host downloadable
  add-in code and documentation; project code does not upload document contents. Publishing,
  repository creation, site enablement, and metadata settings remain owner actions.
- **Visuals:** Created original Cellwise social-preview assets at 1280 x 640 and a separate
  illustrative formula diagram. The diagram is explicitly not a live Word screenshot. Real
  Word screenshots/recordings are deferred until live Word testing. A local documentation
  walkthrough was recorded; it demonstrates only the static documentation site.
- **Community preparation:** Added contribution, conduct, security, issue/PR templates, nine local
  issue drafts, a roadmap issue draft, citation/Zenodo guidance, and non-posted outreach drafts.
  No GitHub issues, labels, Discussions, or submissions were created.
- **Submission research:** Hacker News Show HN requirements were checked on its official page.
  Reddit rules pages could not be retrieved, so the drafts explicitly require manual rule and
  moderator checks. The Office.js curated list found is MIT but last pushed in 2023 and has no
  contribution guide; a broader Office 365 list has no declared license and is stale. Neither is
  recommended for submission without maintainer confirmation.
- **Distribution drafts:** Added clearly marked, non-valid winget, Scoop, and Chocolatey templates.
  They are not submit-ready because the production install route, owner URL, and real release hash
  are unavailable.
- **Verification:** `npm run test`, `npm run typecheck`, `npm run validate`, `npm run pages:build`
  with synthetic HTTPS values, and `git diff --check` passed during Phase F. The site output is
  ignored and local only; GitHub Actions and real Pages deployment are unverified.

## Phase G: Release gate (not cleared)

- **History cleanup:** With the user's approval, used the verified MIT-licensed `git-filter-repo`
  2.47.0 tool to replace personal Windows and Unix profile/workspace paths throughout all local
  refs. All local commit IDs changed. The path scan found no matches in 20 reachable refs or 43
  unique reachable commits.
- **Secret scan:** Gitleaks 8.30.1 was downloaded from the official release and its SHA-256 matched
  the published asset digest. It reported no secrets when each of the 20 refs was scanned separately,
  covering all 43 unique reachable commits, or in the current worktree.
- **Recovery copies:** Three verified pre-rewrite Git bundles remain in the operating-system
  temporary directory, outside the repository. They preserve the old history and must not be
  published; retain them until the rewritten history has been independently accepted.
- **Release blockers:** There is no configured Git remote or confirmed repository owner, no release
  tag, and no GitHub CI/Pages run. MSI remains deferred, the UNC catalog installer is testing-only,
  and live Word/Windows VM checks remain human tasks. No push, tag, deployment, or release has been
  performed.
- **Approval gate:** Do not publish or deploy until the remaining blockers are resolved and the user
  gives the exact `approve release` instruction.