# Contributing

Thanks for considering a contribution to Cellwise. The project is an Office.js add-in with an original, dependency-free formula engine. Live Word behavior is not yet verified, so changes that affect the Office host should include a clear manual test plan.

## Before opening a change

- Check the existing issues and roadmap drafts for related work.
- For a large feature, open an issue first to agree on scope.
- Do not add a package, hosted service, telemetry, Microsoft code/assets, or license exception without maintainer approval.
- Do not include real documents, personal information, credentials, or private logs in an issue or test.

## Development checks

Use Node.js 24 and the committed lockfile:

```powershell
npm ci
npm run test
npm run typecheck
npm run validate
npm run build
```

For the Pages output, set test HTTPS URLs and run `npm run pages:build`; see [site/README.md](site/README.md). This does not publish the site.

## Pull requests

Keep changes focused. Describe the user-visible change, list tests actually run, note any unverified Word or installer behavior, and update directly related documentation. Do not include generated `dist/`, `_site/`, `node_modules/`, or `/release/` output.

All contributions are provided under the repository's MIT License. By submitting a contribution, you confirm that you have the right to submit it under that license.

## Credits and Attribution

If you add new features or modify existing code, please:

- Add your name and a brief description of your contribution to the `CREDITS.md` file (create it if it does not exist).
- Do not remove or alter existing contributor credits.
- If you incorporate third-party code, document its source, license, and any required attribution in `CREDITS.md` and update `NOTICE` if needed.

Not affiliated with or endorsed by Microsoft.
