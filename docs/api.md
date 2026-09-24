# API reference

Base URL: `http://localhost:4000/api` (see `backend/.env` → `API_PUBLIC_URL`
for the value used to build absolute upload URLs).

All admin endpoints require `Authorization: Bearer <token>` obtained from
`POST /auth/login`. Public endpoints require no authentication and only ever
return `PUBLISHED`, non-deleted content.

## Auth

| Method | Path                     | Description                    |
| ------ | ------------------------ | ------------------------------- |
| POST   | /auth/login              | Returns `{ token, user }`       |
| GET    | /auth/me                 | Current authenticated user      |
| POST   | /auth/change-password    | `{ currentPassword, newPassword }` |

## News (admin)

| Method | Path              | Description                              |
| ------ | ----------------- | ----------------------------------------- |
| GET    | /news             | List, filters: `page,pageSize,status,search` |
| GET    | /news/:id         | Get one                                    |
| POST   | /news             | Create (`title, summary?, content`) — always starts as DRAFT |
| PUT    | /news/:id         | Update fields                              |
| PATCH  | /news/:id/status  | `{ status: DRAFT|PUBLISHED|ARCHIVED }`     |
| DELETE | /news/:id         | Soft delete                                |

## Events (admin)

Same shape as News, plus `eventDate` (ISO datetime) and `location` on
create/update. Mounted at `/events`.

## Media

| Method | Path            | Description                                              |
| ------ | --------------- | ---------------------------------------------------------- |
| GET    | /media          | `?entityType=NEWS|EVENT&entityId=123`                       |
| POST   | /media/upload   | multipart/form-data: `file`, `entityType`, `entityId`, `altText?` |
| POST   | /media/external | `{ entityType, entityId, url, altText? }` — image URL or YouTube/Vimeo link |
| PATCH  | /media/reorder  | `{ entityType, entityId, orderedIds: number[] }`            |
| DELETE | /media/:id      | Remove one media item (and its uploaded file, if any)       |

## Public (no auth)

| Method | Path                     | Description                          |
| ------ | ------------------------ | -------------------------------------- |
| GET    | /public/news             | `?page,pageSize` — published only      |
| GET    | /public/news/:slug       | One published article                  |
| GET    | /public/events           | `?page,pageSize,upcomingOnly=true`     |
| GET    | /public/events/:slug     | One published event                    |

## Response shape

```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 } }
```

```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```
