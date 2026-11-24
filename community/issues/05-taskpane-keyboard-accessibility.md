# Draft: Review task-pane accessibility in live Word

**Suggested labels:** `good first issue`, `accessibility`

## Problem

The task pane uses native HTML controls, but keyboard order, focus visibility, error announcements, and screen-reader labels have not been validated inside Word.

## Acceptance criteria

- Test the formula field, Apply, Recalculate, and Help disclosure with keyboard only.
- Confirm status and errors are discoverable to assistive technology.
- Make a focused change only where a reproducible accessibility issue is found.
- Record the host and assistive technology used.
