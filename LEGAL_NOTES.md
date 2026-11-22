# Licensing and legal safeguards

These are engineering constraints, not legal advice.

1. **Licensed host is unaffected.** Cellwise runs as a task-pane add-in inside the user's existing
   Microsoft Word host. It does not modify or replace the user's Word license. Not affiliated with
   or endorsed by Microsoft.
2. **Official documented APIs only.** Use documented Office.js APIs. Do not patch, hook, or reverse
   engineer host behavior or rely on undocumented internals.
3. **No Microsoft code or assets in the repository.** Load the Office.js library from its official
   hosted script URL at runtime. Use original artwork and original project documentation.
4. **Distinct product identity.** The product name is Cellwise. References to Microsoft Word or
   spreadsheet conventions are descriptive only and must be accompanied by the disclaimer:
   "Not affiliated with or endorsed by Microsoft."
5. **Independent formula implementation.** `src/formula.ts` is original and dependency-free.
   Do not copy third-party formula engine code or documentation text. If a dependency is proposed,
   verify its provenance and exact permissive license, update NOTICE, and record the rationale.
6. **Privacy.** Calculations are local. Do not add telemetry or send document data to a network
   service.
7. **Distribution.** Sideload/admin deployment and public store distribution have separate
   requirements. Do not submit to a store or make legal claims without review.
8. **Project license.** MIT is the selected project license. Obtain qualified advice for questions
   about trademark use, distribution, or legal obligations.

## Phase A constraint evidence

| Constraint | Evidence |
|---|---|
| Existing host license is unaffected | Uses the task-pane add-in model; no license modification. |
| Official APIs only | Office.js runtime URL remains in `taskpane.html`; no host patching code. |
| No Microsoft code/assets | Original logo and icons are under `assets/`; no Office.js bundle is checked in. |
| Cellwise product naming | Package metadata, manifest display name, task-pane heading, and README use Cellwise. |
| Local calculations | Formula engine is local; no telemetry or document-data network code added. |
| A1 addressing | `src/formula.ts` and `src/formula.test.ts` cover required coordinates and reverse parsing. |

This table records repository evidence only; it is not a legal review or live-host verification.
