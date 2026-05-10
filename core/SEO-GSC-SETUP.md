Google Search Console (GSC) — Quick Setup Guide

1. Choose property type
- Domain property: verifies entire domain (recommended) via DNS TXT record.
- URL-prefix property: verify a specific protocol+host (e.g., https://thecloudrain.site) via HTML file, HTML tag, Google Analytics, or DNS.

2. Verify ownership (pick one)
- DNS TXT (best for domain): add the TXT record your DNS provider gives you.
- HTML file: upload the verification file to `public/` and confirm in GSC.
- HTML tag: add the meta tag to `<head>` in `core/app/layout.tsx`.

3. Submit sitemap
- Ensure your sitemap is accessible (e.g., `https://thecloudrain.site/sitemap.xml`).
- In GSC, go to Sitemaps → Add sitemap → enter `sitemap.xml`.

4. Coverage & Indexing
- Use the Coverage report to monitor errors, excluded pages, and indexed pages.
- Use URL Inspection to request indexing for important pages (tool detail pages after edits).

5. Performance & Enhancements
- Check Performance → Queries to monitor traffic keywords and CTR.
- Use Enhancements reports (Mobile Usability, Breadcrumbs, etc.) to confirm schema is detected.

Notes for this repo
- Sitemap generation is already handled by the app (server route). Confirm `NEXT_PUBLIC_SITE_URL` is set in production.
- If using HTML verification, add the meta tag into `core/app/layout.tsx` inside `<head>`.
- After verification, submit `sitemap.xml` and allow a few hours for indexing and reports to populate.

Manual tasks (completion checklist)
- [ ] Choose property type and verify
- [ ] Submit sitemap
- [ ] Inspect key pages and request indexing
- [ ] Monitor Coverage and Performance weekly
