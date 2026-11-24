# Cellwise support

## Supported scope

Cellwise is a testing-only Microsoft Word add-in. Live Word and clean-Windows-VM validation is still pending. The installer uses an Office shared-folder trusted catalog, not a production Microsoft-supported installer route.

## Installation

1. Download the Cellwise installer from the final GitHub release.
2. Create and share your own folder on your Windows PC. The folder name and UNC computer/share path must belong to your system; do not use a previously copied example or a local `C:\...` path.
3. Right-click the folder, choose **Properties**, open **Sharing**, and share it so the folder is available on the network.
4. Run the installer. On the **Cellwise catalog** page, enter the UNC path shown by Windows Sharing. Enter a path you created and own, for example `\\DESKTOP-NAME\CellwiseCatalog`, not `C:\Users\...`.
5. Close every Word window and reopen Word 2021.
6. Open a document. Select **Home > Add-ins > Advanced**. In the **Office Add-ins** dialog, select **SHARED FOLDER** at the top, select **Cellwise**, and choose **Add**.

If **Home > Add-ins** is missing, try **Insert > Add-ins > My Add-ins**. Availability varies by Word 2021 build and Microsoft 365/volume-license configuration.

You can also register the folder manually: open **File > Options > Trust Center > Trust Center Settings > Trusted Add-in Catalogs**, enter the UNC path in **Catalog Url**, choose **Add catalog**, enable **Show in Menu**, choose **OK**, and reopen Word.

Office requires UNC shared-folder catalog paths. A local `C:\...` path is not valid for the trusted catalog registry.

## Windows security warning

The installer is currently unsigned. If Windows SmartScreen reports that it prevented the application, do not bypass policies silently. Check the SHA-256 checksum in `SHA256SUMS.txt` and confirm the installer came from the official GitHub release.

## Troubleshooting

### The installer reports an invalid share

- The path must start with `\\`.
- The computer name must be reachable from Word.
- The account running Word must have read and write access.
- Test the UNC path in File Explorer before rerunning the installer.
- Do not enter a OneDrive folder, mapped drive, HTTP URL, or local `C:\` path.

### Cellwise is missing in Word

- Close every Word window and reopen Word.
- Confirm the trusted catalog entry under `HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs`.
- Run the verification script from an installed copy:

```powershell
& "$env:LOCALAPPDATA\Programs\Cellwise\Verify-Cellwise.ps1"
```

### Remove or reinstall Cellwise

Use **Windows Settings > Apps > Installed apps > Cellwise** and choose **Uninstall**. The Start menu can also provide **Support** and **Uninstall Cellwise** entries.

To remove only the add-in registration without using the uninstaller, run:

```powershell
& "$env:LOCALAPPDATA\Programs\Cellwise\Remove-Cellwise.ps1"
```

Close all Word windows before removing or reinstalling. Reopen Word, open **Home > Add-ins > Advanced**, and verify that **SHARED FOLDER** no longer lists Cellwise.

### The task pane does not load

- Check that this URL opens in a browser: https://imakkushwaha555.github.io/CellWise/taskpane.html
- Check Word's add-in and privacy policies with your administrator.
- Clear cached Office add-ins only after documenting the existing registration.

## Range selection

Select a rectangular block of table cells. Cellwise shows the selected A1 range in the side panel, for example `B2:D4`, and fills an empty formula bar with `=SUM(B2:D4)`. It also shows the selected columns and rows as grey guide text inside the task pane. These guides are not inserted into the Word document and cannot appear in printed or PDF output.

## Report a problem

Open an issue: https://github.com/imakkushwaha555/CellWise/issues

Include the Word version, Windows version, installer checksum, whether the UNC share is reachable, and redacted screenshots. Never attach documents or personal data.
