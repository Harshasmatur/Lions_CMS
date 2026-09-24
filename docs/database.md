# Database design

MySQL database `lions_cms`, accessed exclusively through Prisma. See
`backend/prisma/schema.prisma` for the source of truth.

## Tables

- **users** — CMS administrators. `role` is `ADMIN` only for now; the enum
  can grow later (`EDITOR`, `CONTENT_MANAGER`, ...) without a redesign.
- **news** — `status` lifecycle DRAFT → PUBLISHED → ARCHIVED, unique `slug`,
  soft delete via `deleted_at`, sanitized HTML in `content`.
- **events** — same pattern as `news`, plus `event_date` and `location`.
- **media** — polymorphic-by-nullable-FK: each row belongs to exactly one of
  `news_id` / `event_id` (enforced in `media.service.ts`, not at the DB
  level, since MySQL has no native XOR constraint). Supports
  `UPLOAD` / `EXTERNAL_URL` / `YOUTUBE` / `VIMEO` source types.
- **audit_logs** — append-only trail of CREATE/UPDATE/PUBLISH/ARCHIVE/DELETE/
  LOGIN/MEDIA_* actions, with a JSON `metadata` column for before/after detail.

## Delete behavior

| Relation             | On delete |
| --------------------- | --------- |
| User → News/Events     | RESTRICT  |
| User → AuditLogs       | RESTRICT  |
| News/Event → Media     | CASCADE   |

## Indexes

- `users.email` — unique
- `news.slug`, `events.slug` — unique
- `news(status, published_at)`, `events(status, event_date)` — the public
  listing query pattern (`WHERE status = 'PUBLISHED' AND deleted_at IS NULL
  ORDER BY ...`)
- `media(news_id, sort_order)`, `media(event_id, sort_order)` — ordered
  media retrieval per entity
- `audit_logs(entity_type, entity_id)`, `audit_logs(created_at)`

## IDs & timestamps

- All primary keys are `INT AUTOINCREMENT` (not BigInt) — this project is
  nowhere near MySQL's INT ceiling, and it avoids BigInt/JSON serialization
  friction in the API layer.
- All timestamps are stored in UTC; the frontend formats them for display.
