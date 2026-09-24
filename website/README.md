# Public website (placeholder)

This folder is where your existing Lions PU College public site
(HTML/CSS/JS/Bootstrap) lives in the monorepo. It was left out of this
package to keep the download small — copy your existing `public_html`
contents in here as-is; nothing in this build modifies them.

Pages already present in your existing site that are relevant to this
project: `news.html` (a shell you can eventually wire to
`GET /api/public/news`) and the events-related sections of `index.html`.
See `../docs/architecture.md` for how the public API is meant to feed
this site once you're ready for that step.
