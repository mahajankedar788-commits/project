# Database — Online Examination System

PostgreSQL schema for the exam portal, mirroring the JPA entities in
`com.ssit.examportal.entity` column-for-column.

## Files

- **`schema.sql`** — full DDL: enum types, tables, foreign keys, unique
  constraints, check constraints, and indexes. Run this instead of relying on
  Hibernate's `ddl-auto=update` when you want a controlled, reviewable schema
  (e.g. for production).
- **`seed.sql`** — a few sample courses and subjects so the Admin UI has
  something to select from immediately. Safe to skip.
- **`ERD.mermaid`** — entity-relationship diagram of every table and how they
  connect.

## Setup

```bash
createdb examdb
psql -d examdb -f schema.sql
psql -d examdb -f seed.sql   # optional
```

If you'd rather let the Spring Boot app create the schema itself, leave
`spring.jpa.hibernate.ddl-auto=update` (the backend's default) and skip
`schema.sql` — Hibernate will generate equivalent tables from the entities on
first boot. `schema.sql` exists for when you want that schema explicit,
version-controlled, and independent of the app's ORM mappings.

## Design notes

- **Enums as native Postgres types** (`user_role`, `option_key`,
  `attempt_status`) rather than plain `VARCHAR` + check constraint — keeps
  invalid values impossible at the DB layer, matching Hibernate's
  `@Enumerated(EnumType.STRING)` mapping.
- **`users` is separate from `students`** — a `User` is an auth identity
  (username/password/role); a `Student` is academic-record data. An ADMIN
  user has no linked student row; a STUDENT user's `student_id` points to
  theirs. This keeps login credentials decoupled from academic data, so e.g.
  deleting a student's exam history never touches their ability to log in
  (or vice versa).
- **`exam_answers` snapshots the drawn question set per attempt** — rather
  than a separate "exam has these questions" table, each attempt's row set in
  `exam_answers` *is* its randomly-drawn question paper. This means changing
  the question bank later never retroactively changes what a student was
  actually tested on.
- **Two uniqueness guarantees matter most for integrity:**
  `(student_id, exam_id)` on `exam_attempts` — one attempt per student per
  exam — and `(attempt_id, question_id)` on `exam_answers` — a question
  can't appear twice in the same attempt.
- **Indexes** are placed on the columns the backend actually filters/joins
  on: course+semester lookups (for allotment and reporting), subject_id on
  questions/exams, and `(status, expires_at)` on `exam_attempts` for the
  auto-submit sweep job.
