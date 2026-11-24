; Per-user installer for the Windows testing-only trusted-share catalog.
Unicode true

!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "MUI2.nsh"
!include "nsDialogs.nsh"

!ifndef PRODUCT_VERSION
  !error "PRODUCT_VERSION is required"
!endif
!ifndef PRODUCT_VERSION_NUMERIC
  !error "PRODUCT_VERSION_NUMERIC is required"
!endif
!ifndef OUTPUT_FILE
  !error "OUTPUT_FILE is required"
!endif
!ifndef MANIFEST_FILE
  !error "MANIFEST_FILE is required"
!endif
!ifndef VERIFY_SCRIPT
  !error "VERIFY_SCRIPT is required"
!endif
!ifndef LICENSE_FILE
  !error "LICENSE_FILE is required"
!endif
!ifndef NOTICE_FILE
  !error "NOTICE_FILE is required"
!endif
!ifndef REMOVE_SCRIPT
  !error "REMOVE_SCRIPT is required"
!endif

!define PRODUCT_NAME "Cellwise"
!define ADDIN_ID "e1f74c30-625a-4135-9f0a-4dd06dfb1240"
!define CATALOG_ID "643a19ec-9949-4572-9d79-013290c0787a"
!define CATALOG_KEY "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{${CATALOG_ID}}"
!define APP_KEY "Software\Cellwise"
!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\Cellwise"
!define CATALOG_MANIFEST "Cellwise-${ADDIN_ID}.xml"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "${OUTPUT_FILE}"
Icon "..\assets\cellwise.ico"
UninstallIcon "..\assets\cellwise.ico"
VIProductVersion "${PRODUCT_VERSION_NUMERIC}"
VIAddVersionKey "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey "FileVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "ProductVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "FileDescription" "Cellwise Word add-in manifest installer"
VIAddVersionKey "LegalCopyright" "Copyright (c) 2026 Cellwise contributors"
InstallDir "$LOCALAPPDATA\Programs\Cellwise"
InstallDirRegKey HKCU "${APP_KEY}" "InstallDir"
RequestExecutionLevel user
SetCompressor /SOLID zlib
ShowInstDetails show
ShowUninstDetails show

!define MUI_WELCOMEPAGE_TEXT "Cellwise adds local A1-style formulas to Word tables.$\r$\n$\r$\nNot affiliated with or endorsed by Microsoft.$\r$\nNo telemetry is included; document contents are not sent to Cellwise.$\r$\n$\r$\nThis installer registers a network-share catalog for testing. Microsoft does not support this deployment method for production."
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "${LICENSE_FILE}"
Page custom CatalogPageCreate CatalogPageLeave
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Var CatalogUrl
Var CatalogInput
Var OldCatalogUrl

Function .onInit
  IfSilent silent_install interactive_install

  silent_install:
    ${GetOptions} "$CMDLINE" "/CATALOG=" $CatalogUrl
    StrCmp $CatalogUrl "" 0 init_done
    MessageBox MB_ICONSTOP|MB_OK "Silent installation requires /CATALOG=\\server\share."
    Abort

  interactive_install:
  init_done:
FunctionEnd

Function CatalogPageCreate
  nsDialogs::Create 1018
  Pop $0
  ${NSD_CreateLabel} 0 0 100% 36u "1. Share a folder in Windows File Explorer.\r\n2. Enter the UNC path below, for example \\SERVER-PC\CellwiseCatalog.\r\nDo not enter C:\Users\... or a mapped drive."
  Pop $0
  ${NSD_CreateText} 0 40u 100% 18u ""
  Pop $CatalogInput
  ${NSD_CreateLabel} 0 62u 100% 42u "The share must allow Read/Write. Its full network path appears after Folder Properties > Sharing > Share."
  Pop $0
  nsDialogs::Show
FunctionEnd

Function CatalogPageLeave
  ${NSD_GetText} $CatalogInput $CatalogUrl
  Call ValidateCatalogUrl
  Pop $0
  StrCmp $0 "1" catalog_valid
  MessageBox MB_ICONSTOP|MB_OK "Enter a writable UNC share such as \\server\share. Local paths are not supported."
  Abort
  catalog_valid:
FunctionEnd

Function ValidateCatalogUrl
  StrCpy $0 $CatalogUrl 2
  StrCmp $0 "\\" 0 catalog_invalid

  ; Do not use IfFileExists here: NSIS can return false for a valid SMB UNC share.
  ; The file-create test below is the actual permission check.
  StrCpy $1 "$CatalogUrl\.cellwise-write-test-${CATALOG_ID}.tmp"
  ClearErrors
  FileOpen $2 "$1" w
  IfErrors catalog_invalid
  FileClose $2
  Delete "$1"
  Push "1"
  Return

  catalog_invalid:
  Push "0"
FunctionEnd

Section "Install"
  ReadRegStr $OldCatalogUrl HKCU "${APP_KEY}" "CatalogUrl"
  StrCmp $OldCatalogUrl "" catalog_path_ready
  StrCmp $OldCatalogUrl $CatalogUrl catalog_path_ready
  IfSilent catalog_path_change_silent
  MessageBox MB_ICONSTOP|MB_OK "To change the catalog share, uninstall Cellwise first, then install it again with the new share."
  catalog_path_change_silent:
  SetErrorLevel 1
  Abort
  catalog_path_ready:

  SetOutPath "$PLUGINSDIR"
  File /oname=${CATALOG_MANIFEST} "${MANIFEST_FILE}"

  ClearErrors
  CopyFiles /SILENT "$PLUGINSDIR\${CATALOG_MANIFEST}" "$CatalogUrl"
  IfErrors catalog_copy_failed

  CreateDirectory "$INSTDIR"
  SetOutPath "$INSTDIR"
  File /oname=Verify-Cellwise.ps1 "${VERIFY_SCRIPT}"
  File /oname=NOTICE "${NOTICE_FILE}"
  File "/oname=SUPPORT.md" "..\SUPPORT.md"
  File /oname=Remove-Cellwise.ps1 "${REMOVE_SCRIPT}"
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  WriteRegStr HKCU "${APP_KEY}" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${APP_KEY}" "CatalogUrl" "$CatalogUrl"
  WriteRegStr HKCU "${CATALOG_KEY}" "Id" "{${CATALOG_ID}}"
  WriteRegStr HKCU "${CATALOG_KEY}" "Url" "$CatalogUrl"
  WriteRegDWORD HKCU "${CATALOG_KEY}" "Flags" 1
  ReadRegStr $0 HKCU "${CATALOG_KEY}" "Id"
  StrCmp $0 "{${CATALOG_ID}}" 0 registration_failed
  ReadRegStr $0 HKCU "${CATALOG_KEY}" "Url"
  StrCmp $0 $CatalogUrl 0 registration_failed
  ReadRegDWORD $1 HKCU "${CATALOG_KEY}" "Flags"
  IntCmp $1 1 registration_flags_verified registration_failed registration_failed
  registration_flags_verified:
  IfFileExists "$CatalogUrl\${CATALOG_MANIFEST}" registration_verified registration_failed

  registration_verified:
  IfSilent registration_silent
  MessageBox MB_OK|MB_ICONINFORMATION "Cellwise registration verified for this Windows user. Close and reopen Word, then choose the Shared Folder catalog."
  registration_silent:

  WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "Publisher" "Cellwise contributors"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "UninstallString" '$\"$INSTDIR\Uninstall.exe$\"'
  WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayIcon" '$INSTDIR\Uninstall.exe'
  WriteRegStr HKCU "${UNINSTALL_KEY}" "HelpLink" "https://github.com/imakkushwaha555/CellWise/blob/main/SUPPORT.md"
  CreateDirectory "$SMPROGRAMS\Cellwise"
  CreateShortCut "$SMPROGRAMS\Cellwise\Support.lnk" "https://github.com/imakkushwaha555/CellWise/blob/main/SUPPORT.md"
  CreateShortCut "$SMPROGRAMS\Cellwise\Uninstall Cellwise.lnk" "$INSTDIR\Uninstall.exe"
  WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoModify" 1
  Goto install_done

  catalog_copy_failed:
    IfSilent catalog_copy_silent
    MessageBox MB_ICONSTOP|MB_OK "Could not write the manifest to the selected network share. Check the share path and write permissions, then try again."
    catalog_copy_silent:
    SetErrorLevel 1
    Abort

  registration_failed:
    DeleteRegKey HKCU "${CATALOG_KEY}"
    Delete "$CatalogUrl\${CATALOG_MANIFEST}"
    IfSilent registration_error_silent
    MessageBox MB_ICONSTOP|MB_OK "Cellwise could not verify the catalog registration. The installer removed its attempted registry entry and manifest."
    registration_error_silent:
    SetErrorLevel 1
    Abort

  install_done:
SectionEnd

Section "Uninstall"
  ReadRegStr $CatalogUrl HKCU "${APP_KEY}" "CatalogUrl"
  StrCmp $CatalogUrl "" skip_manifest_delete
  IfFileExists "$CatalogUrl\." catalog_share_available manifest_delete_failed
  catalog_share_available:
  IfFileExists "$CatalogUrl\${CATALOG_MANIFEST}" 0 skip_manifest_delete
  ClearErrors
  Delete "$CatalogUrl\${CATALOG_MANIFEST}"
  IfErrors manifest_delete_failed
  skip_manifest_delete:

  DeleteRegKey HKCU "${CATALOG_KEY}"
  DeleteRegKey HKCU "${UNINSTALL_KEY}"
  DeleteRegValue HKCU "${APP_KEY}" "CatalogUrl"
  DeleteRegValue HKCU "${APP_KEY}" "InstallDir"
  DeleteRegKey /ifempty HKCU "${APP_KEY}"
  Delete "$INSTDIR\Verify-Cellwise.ps1"
  Delete "$INSTDIR\NOTICE"
  Delete "$INSTDIR\SUPPORT.md"
  Delete "$INSTDIR\Remove-Cellwise.ps1"
  Delete "$INSTDIR\Uninstall.exe"
  Delete "$SMPROGRAMS\Cellwise\Support.lnk"
  Delete "$SMPROGRAMS\Cellwise\Uninstall Cellwise.lnk"
  RMDir "$SMPROGRAMS\Cellwise"
  RMDir "$INSTDIR"
  Goto uninstall_done

  manifest_delete_failed:
    IfSilent uninstall_share_warning
    MessageBox MB_ICONEXCLAMATION|MB_OK "Cellwise could not verify or remove its manifest from the network share. If the share is unavailable or read-only, check for ${CATALOG_MANIFEST} and remove it manually from $CatalogUrl."
    uninstall_share_warning:
    SetErrorLevel 1
    DeleteRegKey HKCU "${CATALOG_KEY}"
    DeleteRegKey HKCU "${UNINSTALL_KEY}"
    DeleteRegValue HKCU "${APP_KEY}" "CatalogUrl"
    DeleteRegValue HKCU "${APP_KEY}" "InstallDir"
    DeleteRegKey /ifempty HKCU "${APP_KEY}"
    Delete "$INSTDIR\Verify-Cellwise.ps1"
    Delete "$INSTDIR\NOTICE"
    Delete "$INSTDIR\SUPPORT.md"
    Delete "$INSTDIR\Remove-Cellwise.ps1"
    Delete "$INSTDIR\Uninstall.exe"
    Delete "$SMPROGRAMS\Cellwise\Support.lnk"
    Delete "$SMPROGRAMS\Cellwise\Uninstall Cellwise.lnk"
    RMDir "$SMPROGRAMS\Cellwise"
    RMDir "$INSTDIR"

  uninstall_done:
SectionEnd
