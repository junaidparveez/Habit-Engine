# HabitEngine — Architecture

> Last updated: 2026-07-11

---

## Technology Stack

| Layer      | Technology             | Version |
|------------|------------------------|---------|
| Language   | Java                   | 21      |
| Framework  | Spring Boot            | 4.1.0   |
| Build Tool | Maven                  | 3.9+    |
| Database   | PostgreSQL             | 17+     |
| Frontend   | React                  | 19      |
| Bundler    | Vite                   | 8       |
| UI Library | Material UI (MUI)      | Planned |

---

## Layered Architecture

HabitEngine follows a strict **three-layer architecture** to enforce separation of concerns:

```
┌─────────────────────────────────────────┐
│              Client (React)             │
└────────────────┬────────────────────────┘
                 │  HTTP / JSON
┌────────────────▼────────────────────────┐
│           Controller Layer              │
│   REST endpoints, request validation,   │
│   response envelope construction        │
├─────────────────────────────────────────┤
│            Service Layer                │
│   Business logic, orchestration,        │
│   transaction boundaries                │
├─────────────────────────────────────────┤
│          Repository Layer               │
│   JPA repositories, data access,        │
│   query methods                         │
├─────────────────────────────────────────┤
│         PostgreSQL Database             │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer        | Responsibility                                                                 |
|--------------|--------------------------------------------------------------------------------|
| Controller   | Accept HTTP requests, validate input, delegate to services, return responses.  |
| Service      | Encapsulate business rules, coordinate repository calls, manage transactions.  |
| Repository   | Interact with the database via Spring Data JPA. No business logic.             |

### Rules

- Controllers **never** call repositories directly.
- Services **never** return HTTP-specific types (`ResponseEntity`, status codes).
- Repositories contain **no** business logic — only data access.

---

## Package Structure

```
com.junaid.habitengine
├── config/               # Security, CORS, application configuration
├── controller/           # REST controllers
├── dto/                  # Request/Response DTOs
│   ├── request/
│   └── response/
├── exception/            # Custom exceptions & global handler
├── model/                # JPA entity classes
├── repository/           # Spring Data JPA repositories
├── service/              # Business logic services
│   └── impl/             # Service implementations
└── util/                 # Utility/helper classes
```

---

## Design Principles

1. **Single Responsibility** — Each class has one reason to change.
2. **Interface Segregation** — Services are defined by interfaces; implementations are swappable.
3. **DTO Isolation** — Entities are never exposed directly to clients. DTOs handle serialization.
4. **Centralized Error Handling** — A `@RestControllerAdvice` global exception handler produces consistent error responses.
5. **Configuration Externalization** — All environment-specific values live in `application.yaml`, never hard-coded.
6. **Security by Default** — Spring Security is configured from day one; public endpoints are explicitly whitelisted.

---

## Cross-Cutting Concerns

| Concern              | Approach                                                  |
|----------------------|-----------------------------------------------------------|
| Exception Handling   | `GlobalExceptionHandler` with `@RestControllerAdvice`     |
| CORS                 | Centralized `CorsConfig` allowing the React dev server    |
| Security             | Spring Security with permit-all for public routes         |
| Logging              | SLF4J / Logback (Spring Boot default)                     |
| API Versioning       | URL path prefix: `/api/v1`                                |
| Database Migrations  | Flyway (planned); currently `ddl-auto: update`            |
