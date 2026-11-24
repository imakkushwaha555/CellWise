# Changelog

## [1.1.1] - 2026-11-24

- Fixed UNC catalog validation for valid writable SMB shares.
- Removed a redundant directory check that could reject `\\ComputerName\Share` paths.

## [1.1.0] - 2026-11-24

- Added GitHub feedback link in the task pane.
- Added multi-cell A1 range detection and automatic SUM range formulas.
- Added grey column/row guides inside the task pane without adding text to the Word document.

## [1.0.1] - 2026-11-24

- Fixed the installer catalog page so the UNC network path field is clearly visible.
- Improved UNC-share validation and Word 2021 navigation instructions.
- Added a dedicated support guide and installer branding.

## [1.0.0] - Released

- Added the local A1 formula engine and Word table integration.
- Added mock-client regression tests, A1 address round trips, and type checking.
- Added a ZIP package and an NSIS per-user installer prototype for testing with an existing UNC
  trusted catalog.
- Added SHA-256, CycloneDX SBOM, dependency-license report, and build-provenance release automation.
- Added a dependency-free Pages documentation site, formula tutorials, repository/community
  setup drafts, and original social-preview artwork.
- No MSI is included. The current Microsoft-documented UNC deployment route is testing-only and is
  not supported for production.
- The formula diagram is an illustration, not a live Word screenshot; live host and clean-VM tests
  remain pending.
