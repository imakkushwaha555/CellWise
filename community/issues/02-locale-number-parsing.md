# Draft: Define and test numeric parsing rules

**Suggested labels:** `help wanted`, `documentation`

## Problem

Word cell values can include formatting and locale-specific decimal/group separators. The current conversion uses JavaScript `parseFloat` after stripping a small set of symbols, so behavior for values such as `1,25`, `1.234,56`, or formatted currency needs an explicit policy.

## Acceptance criteria

- Document the current accepted numeric forms and known limitations.
- Propose a locale-independent parsing policy before changing implementation.
- Add synthetic unit cases for accepted and rejected examples.
- Do not infer the user's locale from document contents or send values to a remote service.

## Validation

Run formula and Word-client tests. Live host behavior remains a separate manual check.
