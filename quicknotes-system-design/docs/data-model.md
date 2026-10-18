# QuickNotes Data Model

## Entities

**users**

| Column        | Type         | Key / notes                 |
| ------------- | ------------ | --------------------------- |
| id            | BIGINT       | Primary key, auto-increment |
| email         | VARCHAR(255) | Unique, not null            |
| password_hash | VARCHAR(255) | Not null                    |
| created_at    | TIMESTAMP    | Default now                 |

**notes**

| Column     | Type         | Key / notes                       |
| ---------- | ------------ | --------------------------------- |
| id         | BIGINT       | Primary key                       |
| user_id    | BIGINT       | Foreign key -> users.id, not null |
| title      | VARCHAR(100) | Not null                          |
| body       | TEXT         | Optional                          |
| created_at | TIMESTAMP    | Default now                       |
| updated_at | TIMESTAMP    | Default now                       |

**tags**

| Column  | Type        | Key / notes               |
| ------- | ----------- | ------------------------- |
| id      | BIGINT      | Primary key               |
| user_id | BIGINT      | Foreign key -> users.id   |
| name    | VARCHAR(50) | Not null, unique per user |

**note_tags** (join table)

| Column  | Type   | Key / notes                                            |
| ------- | ------ | ------------------------------------------------------ |
| note_id | BIGINT | Foreign key -> notes.id, part of composite primary key |
| tag_id  | BIGINT | Foreign key -> tags.id, part of composite primary key  |

## Relationships

- **One-to-many:** one user has many notes (`notes.user_id`), and one user has many tags (`tags.user_id`). Each note and tag belongs to exactly one user.
- **Many-to-many:** a note can have many tags and a tag can label many notes. A relational database cannot store this directly, so the `note_tags` table holds one row per (note, tag) pair, with a composite primary key to prevent duplicates.

## CREATE TABLE statements

```sql
CREATE TABLE users (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  title      VARCHAR(100) NOT NULL,
  body       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name    VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE note_tags (
  note_id BIGINT NOT NULL,
  tag_id  BIGINT NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);
```

## Example queries

```sql
-- 1. Latest 10 notes of user 17 (powers GET /notes)
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 17
ORDER BY created_at DESC
LIMIT 10;

-- 2. JOIN: all notes of user 17 that carry the tag "shopping"
SELECT n.id, n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t       ON t.id = nt.tag_id
WHERE n.user_id = 17 AND t.name = 'shopping';

-- 3. Number of notes per user, busiest first
SELECT user_id, COUNT(*) AS note_count
FROM notes
GROUP BY user_id
ORDER BY note_count DESC;

-- 4. Delete one note (powers DELETE /notes/{id})
DELETE FROM notes WHERE id = 4821 AND user_id = 17;
```

## Indexes

```sql
CREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);
CREATE INDEX idx_note_tags_tag ON note_tags (tag_id);
```

**Why:** nearly every request lists one user's newest notes. Without `idx_notes_user_created` the database would scan all notes (hundreds of millions of rows); with it, it jumps to the user's rows already sorted by date. `idx_note_tags_tag` speeds up "find notes by tag" (the primary key already covers lookups starting from `note_id`).

## SQL or NoSQL?

I choose **SQL (PostgreSQL or MySQL)**. The data is clearly relational (users, notes, tags and a many-to-many link), we need foreign keys and transactions (for example, creating a note and its tags together), and queries are predictable. One million users is well within what a single primary with read replicas can handle, so we do not need NoSQL's horizontal scaling yet. If we grow far beyond that, we can shard by `user_id`, since a user's data is always accessed together.
