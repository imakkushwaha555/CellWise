# Community outreach drafts

These are drafts only. Do not post until the GitHub repository exists, the live Word/VM tests have been completed, and each community's current rules have been checked. Do not ask for votes, stars, or coordinated engagement.

## Factual launch announcement

> Cellwise is an open-source Office.js add-in prototype for using A1-style cell references in Word tables. It supports a small set of functions (`SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `ABS`, and `ROUND`) and performs formula evaluation locally. It is not full Excel compatibility. The current Windows installer uses a testing-only shared-folder catalog route, and live Word validation is still pending. Source, tests, and current limitations: [repository URL to be added after setup].

## Show HN draft

**Title:** `Show HN: Cellwise – A1-style formulas for tables in Word`

> I built Cellwise to experiment with direct A1 references such as `=SUM(B2:B5)` in Word tables, without adding visible helper labels. The formula engine is a small original TypeScript implementation; it is not Excel-compatible beyond its documented subset. Document values are processed in the add-in and are not uploaded to a Cellwise service.
>
> The code and test checklist are at [repository URL to be added]. I will post only after live Word testing is complete and there is a straightforward way for people to try it. The current UNC installer prototype is testing-only and is not suitable for production. I will be available in the thread to answer questions.

HN's official Show HN guidance requires a project people can actually try, an author who is present to discuss it, and no requests for friends to upvote or comment. This draft is not ready to post while live host testing and a supported trial path are missing.

## Short blog draft

### Why I tried A1 references in Word tables

Word has built-in table calculations, but their field-oriented workflow is different from the explicit cell addresses many spreadsheet users expect. Cellwise is a small experiment in using addresses such as `B2` and ranges such as `B2:B5` inside a Word table, without adding visible row or column labels.

Cellwise currently implements a limited formula subset in original TypeScript. Its formula engine has automated tests, but the Office.js integration still needs live Word validation. The Windows installer prototype depends on a testing-only shared-folder catalog, so it is not a production installation method.

The project is open source under MIT. This article should be updated with verified host results and a tested installation path before publication.

Not affiliated with or endorsed by Microsoft.
