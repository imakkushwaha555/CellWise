# Draft: Identify a supported production installation route

**Suggested labels:** `help wanted`, `blocked`

## Problem

The current NSIS prototype registers a UNC shared-folder catalog that Microsoft documents as testing-only. It is not a verified production self-service install route.

## Acceptance criteria

- Use current official Microsoft deployment documentation.
- Identify a method compatible with this manifest and target Word hosts.
- Record admin requirements, privacy/network behavior, upgrade/uninstall semantics, and licensing.
- Do not implement undocumented registry behavior or a local certificate trust workaround.
- Keep the installer marked testing-only until a supported route is verified.
