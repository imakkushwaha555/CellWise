# Distribution drafts — not for submission

The files in this folder are templates, not valid package submissions. They contain placeholders and must not be published as-is.

The current installer requires an existing UNC share and uses a Microsoft-documented testing-only catalog route. There is no verified production install flow, and GitHub owner/release URLs and real checksums do not exist. Do not submit to winget, Scoop, or Chocolatey until a supported production deployment path is established and installers have passed clean-VM and live-Word tests.

Before preparing real manifests:

1. Confirm a production-supported install/registration route.
2. Confirm repository owner, version, stable release assets, and exact SHA-256 values.
3. Verify current package repository schema and submission policy.
4. Test install, upgrade, repair, and uninstall in a clean Windows VM.
5. Submit a pull request to the relevant official source repository; do not create an unofficial package feed without maintainer consent.
