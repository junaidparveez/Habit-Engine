# HabitEngine — Database

> Last updated: 2026-07-11

---

## Overview

| Item               | Value                    |
|--------------------|--------------------------|
| RDBMS              | PostgreSQL 17+           |
| Database Name      | `habitEngineDB`          |
| ORM                | Spring Data JPA          |
| JPA Provider       | Hibernate                |
| DDL Strategy       | `ddl-auto: update`       |
| Migration Tool     | Flyway (planned)         |

---

## Connection Configuration

Defined in `application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/habitEngineDB
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
```

> **Note:** Credentials are externalized via environment variables — never committed to version control.

---

## DDL Strategy

| Strategy   | When Used      | Behavior                                      |
|------------|----------------|-----------------------------------------------|
| `update`   | **Current**    | Hibernate auto-updates schema on startup.     |
| `validate` | Production     | Validates schema matches entities; no changes. |
| Flyway     | **Planned**    | Versioned SQL migrations for full control.     |

### Migration Roadmap

1. **Now:** `ddl-auto: update` for rapid development.
2. **Before production:** Introduce Flyway, generate a baseline migration from the current schema, switch to `ddl-auto: validate`.

---

## Entity-Relationship Diagram

> 🚧 _No entities defined yet. This section will be populated as domain models are introduced._

```
┌──────────────────┐
│  (entities TBD)  │
└──────────────────┘
```

---

## Entities

> No JPA entities have been created yet. As entities are added, they will be documented here with the following format:

### Template

**Entity:** `ExampleEntity`
**Table:** `example_entities`

| Column       | Type           | Constraints        | Description            |
|--------------|----------------|--------------------|------------------------|
| `id`         | `BIGINT`       | PK, auto-generated | Primary key            |
| `created_at` | `TIMESTAMP`    | NOT NULL           | Record creation time   |
| `updated_at` | `TIMESTAMP`    | NOT NULL           | Last modification time |

---

## Naming Conventions

| Element          | Convention                     | Example              |
|------------------|--------------------------------|----------------------|
| Table names      | `snake_case`, plural           | `habits`             |
| Column names     | `snake_case`                   | `created_at`         |
| Entity classes   | `PascalCase`, singular         | `Habit`              |
| Foreign keys     | `<entity>_id`                  | `user_id`            |
| Join tables      | `<entity1>_<entity2>`          | `user_habits`        |
