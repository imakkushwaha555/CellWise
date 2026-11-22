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
- **Root folder/archive:** The workspace folder will be renamed to `cellwise` after validation.
  No zip/archive existed in the repository at the start of this phase.

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
  UUID: `73fd4aa1-b386-4bb7-8df9-e2c09777b1ed`.
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