# Architecture

## Backend

Modular-by-feature Express app (`backend/src/modules/{auth,news,events,media}`),
each with `controller → service → repository` layering:

- **controller** — HTTP concerns only (parse req, call service, shape response)
- **service** — business rules (slug generation, sanitization, status
  transitions, audit logging)
- **repository** — Prisma queries, isolated so the service layer never talks
  to Prisma directly (news/events only — media's queries are simple enough
  to live in its service)

Cross-cutting concerns live in `common/` (errors, response helpers,
constants, pagination, sanitization, video-embed validation) and
`middleware/` (auth, validation, rate limiting, centralized error handling).

Every mutation (create/update/publish/archive/delete/media changes) writes
an `audit_logs` row via `common/services/audit.service.ts`.

## Frontend

Feature-folder React app (`frontend/src/features/{auth,news,events}`), each
with `pages/services/types`. Shared, cross-feature pieces
(`MediaManager`, `StatusBadge`, the shadcn-style UI kit) live in
`components/common` and `components/ui`. Auth/session state and the shared
Axios instance live in `src/lib`.

The CMS uses the Lions PU College navy/gold identity throughout
(`tailwind.config.js` → `navy`/`gold` palettes) rather than a generic
admin theme.

## Data flow

```
Admin (CMS) ──JWT──▶ /api/news, /api/events, /api/media   (read/write, all statuses)
Public site ────────▶ /api/public/news, /api/public/events (read-only, PUBLISHED only)
```

The public website (`website/`) is untouched in this phase. Wiring its
`news.html`/events sections to the public API is a follow-up step, not
included here, so nothing on the live site changes unexpectedly.
