# HabitEngine — REST API Reference

> Last updated: 2026-07-11

---

## Conventions

| Item           | Value                          |
|----------------|--------------------------------|
| Base URL       | `/api/v1`                      |
| Content-Type   | `application/json`             |
| Auth           | None (public, for now)         |
| Versioning     | URL path (`/api/v1`, `/api/v2` …) |

---

## Response Envelope

All API responses follow a consistent envelope format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "timestamp": "2026-07-11T02:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null,
  "timestamp": "2026-07-11T02:00:00.000Z"
}
```

### Envelope Fields

| Field       | Type      | Description                                      |
|-------------|-----------|--------------------------------------------------|
| `success`   | `boolean` | `true` if the request succeeded, `false` otherwise. |
| `message`   | `string`  | Human-readable status or error message.          |
| `data`      | `object \| array \| null` | Payload. `null` on errors.          |
| `timestamp` | `string`  | ISO-8601 timestamp of the response.              |

---

## HTTP Status Codes

| Code  | Usage                                      |
|-------|--------------------------------------------|
| `200` | Successful GET, PUT, PATCH                 |
| `201` | Successful POST (resource created)         |
| `204` | Successful DELETE (no content)             |
| `400` | Bad Request — validation failure           |
| `401` | Unauthorized — authentication required     |
| `403` | Forbidden — insufficient permissions       |
| `404` | Not Found — resource does not exist        |
| `409` | Conflict — duplicate or state conflict     |
| `500` | Internal Server Error — unexpected failure |

---

## Endpoints

### Health

#### `GET /api/v1/health`

Returns the current health status of the API.

**Authentication:** None

**Request:** No body or parameters.

**Response:**

```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "UP",
    "timestamp": "2026-07-11T02:00:00.000Z"
  },
  "timestamp": "2026-07-11T02:00:00.000Z"
}
```

| Status Code | Condition          |
|-------------|--------------------|
| `200`       | Service is running |

---

### Users

> 🚧 _Coming soon — user registration, login, profile management._

---

### Categories

#### `GET /api/v1/categories`
Returns a list of all categories.

---

### Habits

#### `GET /api/v1/habits`
Returns a list of all habits. 
Query params: `activeOnly=true|false` (optional)

#### `GET /api/v1/habits/{id}`
Returns details for a specific habit.

#### `POST /api/v1/habits`
Creates a new habit.

#### `PUT /api/v1/habits/{id}`
Updates an existing habit.

#### `DELETE /api/v1/habits/{id}`
Deletes a habit.

---

### Completions & Streaks

#### `GET /api/v1/habits/{id}/completions`
Returns a list of completions for a specific habit.

#### `POST /api/v1/habits/{id}/completions`
Marks a habit as completed.
**Body:**
```json
{
  "completionDate": "2026-07-11",
  "note": "Optional note"
}
```

#### `DELETE /api/v1/habits/{id}/completions?date=2026-07-11`
Unmarks a habit as completed for a given date.

---

### Dashboard

#### `GET /api/v1/dashboard/today`
Returns today's active habits along with their completion status and streak information.
Query params: `date=YYYY-MM-DD` (optional, defaults to today)

#### `GET /api/v1/dashboard/stats`
Returns the aggregated global stats for the dashboard (e.g. Total XP, Global Streak, Completion Rate).
Query params: `date=YYYY-MM-DD` (optional, defaults to today)

---

---

### Statistics

#### `GET /api/v1/statistics/heatmap`
Returns activity heatmap data (daily completion counts).
Query params: `startDate=YYYY-MM-DD`, `endDate=YYYY-MM-DD` (defaults to last 365 days)

#### `GET /api/v1/statistics/trends`
Returns completion rate trends aggregated by week.
Query params: `startDate=YYYY-MM-DD`, `endDate=YYYY-MM-DD` (defaults to last 12 weeks)

---

### Goals

#### `GET /api/v1/goals`
Returns a list of all goals.

#### `GET /api/v1/goals/{id}`
Returns a specific goal by ID.

#### `POST /api/v1/goals`
Creates a new goal.
**Body:**
```json
{
  "name": "Read 100 books",
  "description": "Read widely in 2026",
  "targetDate": "2026-12-31"
}
```

#### `PUT /api/v1/goals/{id}`
Updates an existing goal.
**Body:**
```json
{
  "name": "Read 50 books",
  "description": "Adjusted goal",
  "targetDate": "2026-12-31",
  "status": "ACTIVE"
}
```

#### `DELETE /api/v1/goals/{id}`
Deletes a goal. Linked habits will simply be unlinked (goal_id set to null).
