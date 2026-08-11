-- ============================================================================
-- Online Examination System — PostgreSQL schema
-- Mirrors the JPA entities in com.ssit.examportal.entity exactly (snake_case
-- columns, same constraints). Safe to run standalone instead of relying on
-- Hibernate's ddl-auto=update, e.g. for a production deployment.
--
-- Usage:
--   createdb examdb
--   psql -d examdb -f schema.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('ADMIN', 'STUDENT');
CREATE TYPE option_key AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE attempt_status AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED');

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
    id          BIGSERIAL PRIMARY KEY,
    course_name VARCHAR(150) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------
CREATE TABLE students (
    id         BIGSERIAL PRIMARY KEY,
    reg_no     VARCHAR(50)  NOT NULL UNIQUE,
    name       VARCHAR(150) NOT NULL,
    course_id  BIGINT       NOT NULL REFERENCES courses (id),
    semester   INTEGER      NOT NULL CHECK (semester BETWEEN 1 AND 8),
    email      VARCHAR(150) NOT NULL,
    mobile     VARCHAR(20),
    photo_url  TEXT
);

CREATE INDEX idx_students_course_semester ON students (course_id, semester);

-- ---------------------------------------------------------------------------
-- users  (auth identities — admins have student_id NULL; students have it set)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id                   BIGSERIAL PRIMARY KEY,
    username             VARCHAR(50)  NOT NULL UNIQUE,
    password_hash        VARCHAR(100) NOT NULL,
    role                 user_role    NOT NULL,
    must_change_password BOOLEAN      NOT NULL DEFAULT FALSE,
    student_id           BIGINT UNIQUE REFERENCES students (id)
);

-- ---------------------------------------------------------------------------
-- subjects
-- ---------------------------------------------------------------------------
CREATE TABLE subjects (
    id               BIGSERIAL PRIMARY KEY,
    subject_code     VARCHAR(30)  NOT NULL UNIQUE,
    subject_name     VARCHAR(150) NOT NULL,
    course_id        BIGINT       NOT NULL REFERENCES courses (id),
    semester         INTEGER      NOT NULL CHECK (semester BETWEEN 1 AND 8),
    total_marks      INTEGER      NOT NULL CHECK (total_marks > 0),
    passing_marks    INTEGER      NOT NULL CHECK (passing_marks > 0),
    duration_minutes INTEGER      NOT NULL CHECK (duration_minutes > 0),
    CONSTRAINT chk_passing_le_total CHECK (passing_marks <= total_marks)
);

CREATE INDEX idx_subjects_course_semester ON subjects (course_id, semester);

-- ---------------------------------------------------------------------------
-- student_subject_allotment
-- ---------------------------------------------------------------------------
CREATE TABLE student_subject_allotment (
    id         BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT uq_student_subject UNIQUE (student_id, subject_id)
);

CREATE INDEX idx_allotment_student ON student_subject_allotment (student_id);

-- ---------------------------------------------------------------------------
-- questions
-- ---------------------------------------------------------------------------
CREATE TABLE questions (
    id             BIGSERIAL PRIMARY KEY,
    subject_id     BIGINT      NOT NULL REFERENCES subjects (id) ON DELETE CASCADE,
    question_text  TEXT        NOT NULL,
    option_a       VARCHAR(500) NOT NULL,
    option_b       VARCHAR(500) NOT NULL,
    option_c       VARCHAR(500) NOT NULL,
    option_d       VARCHAR(500) NOT NULL,
    correct_option option_key  NOT NULL,
    marks          INTEGER     NOT NULL CHECK (marks > 0)
);

CREATE INDEX idx_questions_subject ON questions (subject_id);

-- ---------------------------------------------------------------------------
-- exams
-- ---------------------------------------------------------------------------
CREATE TABLE exams (
    id               BIGSERIAL PRIMARY KEY,
    exam_name        VARCHAR(150) NOT NULL,
    subject_id       BIGINT    NOT NULL REFERENCES subjects (id),
    start_time       TIMESTAMPTZ NOT NULL,
    end_time         TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER   NOT NULL CHECK (duration_minutes > 0),
    total_questions  INTEGER   NOT NULL CHECK (total_questions > 0),
    CONSTRAINT chk_exam_window CHECK (end_time > start_time)
);

CREATE INDEX idx_exams_subject ON exams (subject_id);
CREATE INDEX idx_exams_window ON exams (start_time, end_time);

-- ---------------------------------------------------------------------------
-- exam_attempts  (one row per student per exam)
-- ---------------------------------------------------------------------------
CREATE TABLE exam_attempts (
    id           BIGSERIAL PRIMARY KEY,
    student_id   BIGINT         NOT NULL REFERENCES students (id),
    exam_id      BIGINT         NOT NULL REFERENCES exams (id),
    started_at   TIMESTAMPTZ    NOT NULL,
    expires_at   TIMESTAMPTZ    NOT NULL,
    submitted_at TIMESTAMPTZ,
    status       attempt_status NOT NULL,
    total_score  INTEGER,
    CONSTRAINT uq_student_exam UNIQUE (student_id, exam_id)
);

CREATE INDEX idx_attempts_exam ON exam_attempts (exam_id);
CREATE INDEX idx_attempts_status_expiry ON exam_attempts (status, expires_at);

-- ---------------------------------------------------------------------------
-- exam_answers  (the specific questions drawn for an attempt + the student's picks)
-- ---------------------------------------------------------------------------
CREATE TABLE exam_answers (
    id              BIGSERIAL PRIMARY KEY,
    attempt_id      BIGINT     NOT NULL REFERENCES exam_attempts (id) ON DELETE CASCADE,
    question_id     BIGINT     NOT NULL REFERENCES questions (id),
    selected_option option_key,
    is_correct      BOOLEAN,
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_answers_attempt ON exam_answers (attempt_id);
