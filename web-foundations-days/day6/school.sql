-- Day 6: School database (SQLite)

PRAGMA foreign_keys = ON;

-- ---------- Tables ----------

CREATE TABLE students (
    id         INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name  TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    id      INTEGER PRIMARY KEY,
    title   TEXT NOT NULL,
    credits INTEGER NOT NULL
);

CREATE TABLE enrolments (
    id          INTEGER PRIMARY KEY,
    student_id  INTEGER NOT NULL,
    course_id   INTEGER NOT NULL,
    enrolled_on TEXT NOT NULL,
    grade       TEXT,  -- NULL until the student has been graded
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (course_id)  REFERENCES courses (id),
    UNIQUE (student_id, course_id)  -- same student cannot enrol on the same course twice
);

-- ---------- Sample data ----------

INSERT INTO students (first_name, last_name, email) VALUES
    ('Amina',  'Hassan', 'amina.hassan@example.com'),
    ('Brian',  'Otieno', 'brian.otieno@example.com'),
    ('Chloe',  'Mwangi', 'chloe.mwangi@example.com'),
    ('David',  'Kamau',  'david.kamau@example.com');

INSERT INTO courses (title, credits) VALUES
    ('Web Foundations',  10),
    ('Databases',        10),
    ('Python Basics',     5);

INSERT INTO enrolments (student_id, course_id, enrolled_on, grade) VALUES
    (1, 1, '2026-09-01', 'A'),
    (1, 2, '2026-09-01', 'B'),
    (2, 1, '2026-09-02', 'B'),
    (2, 3, '2026-09-02', NULL),
    (3, 2, '2026-09-03', 'A');
-- David (student 4) has no enrolments on purpose, for query 4.

-- ---------- Queries ----------

-- 1. All courses for one student (by name)
SELECT c.title, c.credits, e.grade
FROM students s
JOIN enrolments e ON e.student_id = s.id
JOIN courses c    ON c.id = e.course_id
WHERE s.first_name = 'Amina' AND s.last_name = 'Hassan';

-- 2. All students on one course
SELECT s.first_name, s.last_name, s.email
FROM courses c
JOIN enrolments e ON e.course_id = c.id
JOIN students s   ON s.id = e.student_id
WHERE c.title = 'Databases';

-- 3. Number of students per course (courses with none show 0)
SELECT c.title, COUNT(e.id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON e.course_id = c.id
GROUP BY c.id, c.title;

-- 4. Students who have no enrolments
SELECT s.id, s.first_name, s.last_name
FROM students s
LEFT JOIN enrolments e ON e.student_id = s.id
WHERE e.id IS NULL;

-- 5. Update one enrolment's grade (Brian, Python Basics)
UPDATE enrolments
SET grade = 'B'
WHERE student_id = (SELECT id FROM students WHERE email = 'brian.otieno@example.com')
  AND course_id  = (SELECT id FROM courses  WHERE title = 'Python Basics');

-- Check the update worked
SELECT s.first_name, c.title, e.grade
FROM enrolments e
JOIN students s ON s.id = e.student_id
JOIN courses c  ON c.id = e.course_id
WHERE s.first_name = 'Brian';