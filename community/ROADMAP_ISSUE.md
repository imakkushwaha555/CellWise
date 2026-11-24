# Pinned roadmap issue draft

**Title:** Cellwise roadmap and current testing status
**Labels:** `roadmap`, `help wanted`

Cellwise is an open-source prototype for A1-style formulas in Word tables. The formula engine and mock Word client have automated tests, but live Word behavior and clean Windows installer behavior are not yet verified.

## Near-term gates

- [ ] Confirm the GitHub repository owner and create the repository.
- [ ] Run the CI and Pages workflows in the real repository.
- [ ] Complete live Word tests on supported hosts and document exact versions.
- [ ] Test the Windows installer in a clean standard-user VM, including uninstall cleanup.
- [ ] Identify a supported production installation route; the current UNC catalog route is testing-only.
- [ ] Revisit installer signing eligibility and SmartScreen behavior without buying a certificate.

## Later improvements

- [ ] Improve accessibility and task-pane usability based on real host testing.
- [ ] Expand the formula subset only through reviewed proposals and focused tests.
- [ ] Consider additional distribution channels only after a production installation path is verified.

Please open one focused issue per proposal. Do not include real documents or confidential information.
