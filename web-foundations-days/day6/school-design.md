# Day 6: School Database Design

## Tables

**students** stores one row per student: an `id` (primary key), first and last name, and an `email`. The email is `NOT NULL` and `UNIQUE`, so two students can never share an address.

**courses** stores one row per course: an `id` (primary key), a `title` and the number of `credits`. Both are `NOT NULL`.

**enrolments** records the fact that a particular student is on a particular course. It holds `student_id` and `course_id` (both foreign keys), the date enrolled, and the `grade`. The grade is nullable because a student has no grade until they are assessed. A `UNIQUE (student_id, course_id)` constraint stops the same student enrolling on the same course twice.

## Relationships

- **students → enrolments is one-to-many.** One student can have many enrolments, but each enrolment belongs to exactly one student.
- **courses → enrolments is one-to-many.** One course can have many enrolments, but each enrolment belongs to exactly one course.
- **students ↔ courses is many-to-many.** A student can take many courses, and a course has many students.

A many-to-many relationship cannot be stored in a single column without cramming several values into one field or duplicating rows, which breaks the rules of a well-formed relational table. A join table (`enrolments`) solves this: each row pairs one student with one course, turning one many-to-many relationship into two one-to-many ones. It is also the natural home for data about the pairing itself, such as the grade, which belongs to neither the student nor the course alone.

## Index

I would add an index on `enrolments(course_id)`:

```sql
CREATE INDEX idx_enrolments_course_id ON enrolments (course_id);
```

The `UNIQUE (student_id, course_id)` constraint already creates an index that helps lookups by student, but not lookups by course alone. Queries such as "all students on this course" and "number of students per course" filter or join on `course_id`, and without an index SQLite has to scan the whole enrolments table. As the table grows this index keeps those queries fast.

## SQL or NoSQL?

I would choose SQL for this system. The data is clearly structured and relational: students, courses and enrolments have fixed fields and well-defined links between them. A relational database enforces that structure for us, with foreign keys preventing enrolments for students or courses that do not exist, `UNIQUE` preventing duplicate enrolments, and `NOT NULL` preventing missing data. Joins and `GROUP BY` make the questions a school actually asks (who is on this course, who has no courses, how many students per course) simple to write. Grades and enrolments also need to be accurate, so the transaction guarantees of SQL matter. NoSQL would make more sense if the data were loosely structured, changed shape often, or had to scale across many servers, and none of that applies here.
