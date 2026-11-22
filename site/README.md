# Documentation site

This directory contains a dependency-free static documentation site. It is built with `npm run pages:build` into the ignored `_site/` folder. The build generates the original 1280 x 640 social-preview PNG without external packages and copies the add-in's built `dist/` files to the site root so the hosted task-pane resources share the same HTTPS origin.

Before building, set:

```powershell
$env:CELLWISE_BASE_URL = 'https://OWNER.github.io/cellwise'
$env:CELLWISE_REPOSITORY_URL = 'https://github.com/OWNER/cellwise'
npm run pages:build
```

The build rejects non-HTTPS URLs, repository names other than `cellwise`, and mismatched GitHub Pages/repository owners. Replace `OWNER` with the actual account or organization; no repository currently exists. Do not publish the site until the release owner approves the repository and Pages setup.

The generated site contains a landing page, four tutorials, per-page SEO metadata, JSON-LD, a sitemap, robots rules, and the add-in resources. It uses no remote fonts, analytics, or JavaScript framework. The formula illustration is explicitly labeled as an illustration, not a live Word screenshot.

The deployment uses GitHub's [custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Office add-in host limitations and testing requirements should be checked against Microsoft's [Office Add-in testing guidance](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/test-debug-office-add-ins).
