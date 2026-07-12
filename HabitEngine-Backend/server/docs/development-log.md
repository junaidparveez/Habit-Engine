# HabitEngine — Development Log

> A chronological record of milestones, decisions, and progress.

---

## Milestone 1: Project Foundation & Configuration

**Date:** 2026-07-11
**Status:** ✅ Complete

### Summary

Established the foundational project structure, configuration, and infrastructure for the HabitEngine backend.

### What Was Done

| #  | Task                        | Details                                                                 |
|----|-----------------------------|-------------------------------------------------------------------------|
| 1  | Project Analysis            | Reviewed project requirements, defined layered architecture approach.   |
| 2  | `application.yaml` Config   | Configured server port, datasource, JPA/Hibernate, and logging.        |
| 3  | Security Configuration      | Set up Spring Security with permit-all for public endpoints.            |
| 4  | CORS Configuration          | Centralized CORS config allowing the React dev server (`localhost:5173`). |
| 5  | Global Exception Handler    | Implemented `@RestControllerAdvice` with consistent error envelope.     |
| 6  | Health Endpoint             | Created `GET /api/v1/health` returning service status.                  |
| 7  | Documentation Setup         | Created architecture, API, database, frontend, and dev-log docs.        |

### Key Decisions

| Decision                          | Rationale                                                          |
|-----------------------------------|--------------------------------------------------------------------|
| Spring Boot 4.1.0 + Java 21      | LTS Java version with latest Spring Boot for modern features.      |
| `ddl-auto: update` (temporary)    | Rapid iteration during early development; Flyway planned later.    |
| URL-based API versioning (`/v1`)  | Simple, explicit, easy to evolve without breaking clients.         |
| Response envelope pattern         | Consistent contract for frontend — every response has the same shape. |
| Docs in `server/docs/`           | Co-located with backend code for easy discovery and maintenance.   |

### Files Created / Modified

```
server/
├── src/main/resources/
│   └── application.yaml
├── src/main/java/com/junaid/habitengine/
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── CorsConfig.java
│   ├── controller/
│   │   └── HealthController.java
│   └── exception/
│       └── GlobalExceptionHandler.java
└── docs/
    ├── architecture.md
    ├── api.md
    ├── database.md
    ├── frontend.md
    └── development-log.md
```

---

## Milestone 2: Frontend Foundation

**Date:** 2026-07-11
**Status:** ✅ Complete

### Summary
Established the frontend React application with Material UI, routing, and basic folder structure.

### What Was Done
- Scaffolded frontend with Vite, React, and MUI
- Created application theme (dark/light mode) and MainLayout with Sidebar
- Added placeholder pages for Dashboard, Habits, Statistics, and Goals
- Set up Axios client with base URL pointing to Backend API
- Verified end-to-end connectivity via Health API

---

## Milestone 3: Habit CRUD

**Date:** 2026-07-11
**Status:** ✅ Complete

### Summary
Implemented full Create, Read, Update, Delete for Habits and Categories on both Backend and Frontend.

### What Was Done
- Backend: Created `Habit` and `Category` entities, repositories, and services
- Backend: Expose `HabitController` and `CategoryController` REST APIs
- Backend: Wrote integration tests verifying the full flow
- Frontend: Implemented `habitApi` and `categoryApi`
- Frontend: Created `Habits` page displaying all habits as cards
- Frontend: Implemented Add, Edit, and Delete modals with form validation

---

## Milestone 4: Habit Completion Tracking

**Date:** 2026-07-11
**Status:** ✅ Complete

### Summary
Added the ability to check off habits on a daily basis.

### What Was Done
- Backend: Created `HabitCompletion` entity to track completions by date
- Backend: Added `DashboardController` providing today's habit status
- Frontend: Created `Dashboard` view displaying today's habits
- Frontend: Added toggle button to mark/unmark habits as completed today

---


## Milestone 5: Streak Engine

**Date:** 2026-07-10
**Status:** ✅ Complete

### Summary
Added gamification elements via streak tracking.

### What Was Done
- Backend: Created `HabitStreak` entity to track current and longest streaks.
- Backend: Created `StreakService` to recalculate streaks upon marking/unmarking completions.
- Backend: Injected streak information into `HabitResponse`.
- Frontend: Display 🔥 streak counts conditionally on Habit Cards and Dashboard.

---

## Milestone 6: Dashboard Refinement

**Date:** 2026-07-11
**Status:** ✅ Complete

### Summary
Enhanced the Dashboard to show real-time aggregated stats.

### What Was Done
- Backend: Implemented `/api/v1/dashboard/stats` aggregation endpoint.
- Frontend: Updated the Dashboard to use real stats for Completion Rate, Total XP, and Current Streak.
- Frontend: Integrated `recharts` and rendered a dynamic PieChart progress ring for the Completion Rate card.

---

## Milestone 7: Statistics & Calendar View

**Date:** 2026-07-11
**Status:** ✅ Complete

### Summary
Built a comprehensive historical statistics view.

### What Was Done
- Backend: Created `/api/v1/statistics/heatmap` and `/api/v1/statistics/trends` endpoints.
- Backend: Updated `HabitCompletionRepository` to fetch completions between date ranges.
- Frontend: Created `StatisticsPage.jsx` with real data fetching.
- Frontend: Built a custom GitHub-style calendar heatmap component using MUI Grid.
- Frontend: Implemented a historical completion trend chart using Recharts `LineChart`.

---

## Milestone 8: Goal System

**Date:** 2026-07-11
**Status:** ✅ Complete

### Summary
Built the goal tracking system to allow long-term habit aggregation.

### What Was Done
- Backend: Created `Goal` entity and repositories, linked `Habit` to `Goal` with a `@ManyToOne` mapping.
- Backend: Implemented `GoalController` and `GoalService` with CRUD endpoints and dynamic progress calculation based on linked habit active streaks.
- Frontend: Created `GoalsPage.jsx` showing goal progress and stats.
- Frontend: Updated the `HabitFormDialog` to allow assigning a habit to an existing goal.

---

## Milestone 9: Authentication (JWT)

**Date:** TBD
**Status:** 🔜 Planned

### Planned Work
- Spring Security integration with JWT filter
- User registration and login endpoints
- Route protection in React (Guarded Routes)
