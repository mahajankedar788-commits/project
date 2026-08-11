-- ============================================================================
-- Sample seed data — safe to skip in production.
-- Run after schema.sql: psql -d examdb -f seed.sql
--
-- Note: the default ADMIN account is already seeded automatically by the
-- Spring Boot app on first boot (see AdminSeeder / SEED_ADMIN_USERNAME env
-- var) — no need to insert one here. Student accounts should be created via
-- POST /api/admin/students so the password is generated and hashed correctly;
-- inserting a working password hash by hand isn't practical from plain SQL.
-- ============================================================================

INSERT INTO courses (course_name) VALUES
    ('Diploma in Computer Engineering'),
    ('Diploma in Information Technology'),
    ('Diploma in Electronics & Telecommunication');

INSERT INTO subjects (subject_code, subject_name, course_id, semester, total_marks, passing_marks, duration_minutes)
SELECT 'CO22412', 'Java Programming', c.id, 4, 100, 40, 60
FROM courses c WHERE c.course_name = 'Diploma in Computer Engineering';

INSERT INTO subjects (subject_code, subject_name, course_id, semester, total_marks, passing_marks, duration_minutes)
SELECT 'CO22413', 'Database Management Systems', c.id, 4, 100, 40, 60
FROM courses c WHERE c.course_name = 'Diploma in Computer Engineering';

INSERT INTO subjects (subject_code, subject_name, course_id, semester, total_marks, passing_marks, duration_minutes)
SELECT 'IT22414', 'Web Application Development', c.id, 4, 100, 40, 60
FROM courses c WHERE c.course_name = 'Diploma in Information Technology';
