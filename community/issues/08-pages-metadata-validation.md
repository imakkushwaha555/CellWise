# Draft: Add automated validation for generated Pages metadata

**Suggested labels:** `good first issue`, `testing`

## Problem

The static site templates are checked for unique titles, descriptions, canonical paths, JSON-LD, and sitemap coverage. Generated output should also be checked for unresolved placeholders and broken internal links.

## Acceptance criteria

- Validate the generated `_site` after `npm run pages:build`.
- Check every relative link and image path resolves within the generated site.
- Reject unresolved URL placeholders.
- Keep the checker dependency-free.

## Validation

Run `npm run test` and `npm run pages:build` with synthetic HTTPS URLs.
