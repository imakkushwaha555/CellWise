# Cellwise installer testing

## Status

**Not tested in a clean Windows VM or in live Word.** This installer uses Microsoft's
documented network-share trusted-catalog workflow for development/testing. Microsoft states that
network-share deployment is not supported for production add-ins. The installer does not create
a network share, change firewall settings, install a certificate, or create a scheduled task.

The add-in page itself must be hosted at a public HTTPS URL before the packaged manifest can work.
The installer copies the manifest to a user-provided UNC share and registers that share under the
current user's Office registry.

## Build

Requirements: Windows, Node.js, NSIS 3.13, and an HTTPS-hosted Cellwise site/repository.

```powershell
$env:CELLWISE_BASE_URL = 'https://OWNER.github.io/cellwise'
$env:CELLWISE_REPOSITORY_URL = 'https://github.com/OWNER/cellwise'
npm run package
```

Replace `OWNER` with the actual GitHub account or organization. Do not use these placeholders
literally. The command creates a sideload ZIP and an unsigned `.exe` in the ignored `release/`
directory. It refuses localhost and placeholder hosts.

## Install and verify

1. Make a folder and share it using Windows folder-sharing settings. Confirm your user has read/write
   access and note its UNC path (for example, `\\ComputerName\CellwiseCatalog`). The installer does
   not create the share; this setup may require Windows sharing permissions.
2. Run `Cellwise-Setup-<version>.exe` as the current user. Do not elevate it. On the catalog page,
   enter the UNC path.
3. Close and reopen Word. Open **Home > Add-ins > Advanced**. In the Office Add-ins dialog, select **SHARED FOLDER**, select Cellwise, and
   add it.
4. Run `scripts\Verify-Cellwise.ps1` from PowerShell. Expected output begins `Cellwise registration: OK`.
5. Apply and recalculate formulas using the checklist in [TESTING.md](TESTING.md).

### Silent install

```powershell
.\Cellwise-Setup-<version>.exe /S '/CATALOG=\\ComputerName\CellwiseCatalog'
```

Silent mode requires the catalog argument. A share path with spaces must be quoted as one
argument. The uninstaller supports NSIS's `/S` silent switch.

### Repair, upgrade, and uninstall

- **Repair:** rerun the same installer with the same share path; it replaces the registered
  manifest and refreshes the current user's install record.
- **Upgrade:** run the newer installer with the same share path. To change the share path, uninstall
  first, then install again; this avoids leaving an old catalog manifest behind.
- **Uninstall:** use **Apps & features** or the installed `Uninstall.exe`. It removes Cellwise's
  manifest, its own trusted-catalog registry key, its uninstall record, and its own local files.
  The share folder itself is user-owned and is not removed. If it is unavailable during uninstall,
  the uninstaller warns that the manifest may remain and reports where to check.
- No certificate or scheduled task is created. Office may cache add-in data; any remaining cached
  entry may require the documented Office cache-clearing steps.

## Clean VM test matrix

On a clean Windows VM with Word installed, test each case and record the Windows/Word versions:

1. Fresh install as a standard (non-admin) user using a writable UNC share.
2. Confirm only the current user's `TrustedCatalogs\{643a19ec-9949-4572-9d79-013290c0787a}` key is
   added and the manifest appears in Word's Shared Folder list.
3. Confirm `Verify-Cellwise.ps1` reports `OK`, then apply a simple formula and recalculate it.
4. Rerun the same installer (repair), then install a newer version (upgrade); verify one catalog
   registration and one manifest remain.
5. Uninstall; verify the Cellwise registry values and manifest are gone, and the share, local
   install directory, certificates, and scheduled tasks were not created/left by Cellwise.
6. Attempt silent install with `/S /CATALOG=...`, then uninstall silently. Confirm a missing
   `/CATALOG` argument fails rather than reporting success.
7. Test a read-only or unavailable share. Install must fail explicitly; uninstall must report any
   manifest it could not remove.
8. Observe SmartScreen behavior for the unsigned setup. Do not bypass warnings automatically.

## SmartScreen and signing

The installer is currently unsigned. Microsoft explains that unsigned downloads can show the
"Windows protected your PC" warning, and signed files can also warn until publisher or file-hash
reputation develops. Enterprise policy may prevent running an unsigned installer.

[SignPath Foundation](https://signpath.org/) says it provides free code signing for eligible
open-source projects. Its published conditions require an OSI-approved license, a released and
actively maintained project, clear project ownership/maintainers, MFA, defined author/reviewer/
approver roles, and a published code-signing policy. The Foundation, not the project, is the
certificate publisher; every release requires manual signing approval. Application is at
<https://signpath.org/apply>. Cellwise has not applied and acceptance is not guaranteed. Do not
describe signing as eliminating all SmartScreen warnings.
