# Licensing & legal safeguards (engineering notes, not legal advice)

1. **Official APIs only.** The add-in uses Office.js (the Microsoft-supported extension model).
   No patching, hooking, or reverse engineering of Word; no use of undocumented internals.
   It runs inside the user's own licensed Word and changes nothing about that license.
2. **No Microsoft code or assets bundled.** office.js is loaded from Microsoft's CDN at runtime
   per Microsoft's terms; do not copy it into the repo. Use your own icons/branding.
3. **Own formula engine.** `src/formula.ts` is original, dependency-free code, so there are no
   third-party license obligations. If you add libraries, stick to MIT/Apache-2.0 and keep a NOTICE file.
4. **Naming/trademarks.** Don't use "Microsoft", "Word", or "Excel" as part of the product name or logo
   (e.g. "Table Formulas for Word" is fine as a descriptive reference; "Word Excel Pro" is not).
   Add a disclaimer: "Not affiliated with or endorsed by Microsoft."
5. **Excel-like, not Excel.** Implement common spreadsheet semantics independently; don't copy
   Microsoft documentation text or claim compatibility guarantees.
6. **Distribution.** Publish via Microsoft AppSource (Partner Center agreement) or sideload/admin deploy.
7. **Your own license.** Project is MIT by default; change as needed. Have a lawyer review before commercial release.
8. **Privacy.** All calculation happens locally in the task pane; no document data leaves the machine.
