# QuickNotes API Design

This describes the **real** QuickNotes REST API the backend team will build (not JSONPlaceholder). Base URL: `https://api.quicknotes.example/v1`. All bodies are JSON. Authenticated endpoints need `Authorization: Bearer <token>`.

## Endpoints

| #   | Method | Path                                 | Description                                 | Success status |
| --- | ------ | ------------------------------------ | ------------------------------------------- | -------------- |
| 1   | GET    | `/notes?limit=10&cursor=...&tag=...` | List the signed-in user's notes (paginated) | 200 OK         |
| 2   | POST   | `/notes`                             | Create a note                               | 201 Created    |
| 3   | GET    | `/notes/{id}`                        | Get one note                                | 200 OK         |
| 4   | PUT    | `/notes/{id}`                        | Replace a note (title, body, tags)          | 200 OK         |
| 5   | PATCH  | `/notes/{id}`                        | Partially update a note                     | 200 OK         |
| 6   | DELETE | `/notes/{id}`                        | Delete a note                               | 204 No Content |
| 7   | GET    | `/tags`                              | List the user's tags                        | 200 OK         |
| 8   | POST   | `/notes/{id}/tags`                   | Attach a tag to a note                      | 201 Created    |
| 9   | DELETE | `/notes/{id}/tags/{tagId}`           | Remove a tag from a note                    | 204 No Content |
| 10  | POST   | `/users`                             | Register a user                             | 201 Created    |
| 11  | POST   | `/sessions`                          | Log in, returns a token                     | 200 OK         |

Design choices: nouns in plural form, HTTP verbs carry the action, user identity comes from the token (not the URL), and lists use cursor pagination so they stay fast at 1 million users.

## Example: create a note

`POST /notes`

```json
{
  "title": "Buy milk",
  "body": "Two litres, semi-skimmed",
  "tags": ["shopping"]
}
```

Response `201 Created` (with header `Location: /v1/notes/4821`):

```json
{
  "id": 4821,
  "userId": 17,
  "title": "Buy milk",
  "body": "Two litres, semi-skimmed",
  "tags": ["shopping"],
  "createdAt": "2026-10-18T09:30:00Z",
  "updatedAt": "2026-10-18T09:30:00Z"
}
```

## Example: list notes

`GET /notes?limit=2`

Response `200 OK`:

```json
{
  "data": [
    {
      "id": 4821,
      "title": "Buy milk",
      "body": "Two litres, semi-skimmed",
      "tags": ["shopping"],
      "createdAt": "2026-10-18T09:30:00Z"
    },
    {
      "id": 4790,
      "title": "Call Amina",
      "body": "",
      "tags": [],
      "createdAt": "2026-10-17T18:02:11Z"
    }
  ],
  "nextCursor": "eyJpZCI6NDc5MH0=",
  "count": 2
}
```

## Error status codes

| Status                    | Meaning           | When it happens                                             |
| ------------------------- | ----------------- | ----------------------------------------------------------- |
| 400 Bad Request           | Invalid input     | Title missing or longer than 100 characters, malformed JSON |
| 401 Unauthorized          | Not authenticated | Missing, expired or invalid token                           |
| 403 Forbidden             | Not allowed       | Reading or deleting another user's note                     |
| 404 Not Found             | Missing resource  | Note or tag id does not exist                               |
| 409 Conflict              | State conflict    | Registering an email that already exists                    |
| 429 Too Many Requests     | Rate limited      | Too many requests from one client                           |
| 500 Internal Server Error | Server bug        | Unexpected failure; safe to retry later                     |

Example error body (all errors share this shape):

```json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": [
      { "field": "title", "issue": "must be between 1 and 100 characters" }
    ]
  }
}
```
