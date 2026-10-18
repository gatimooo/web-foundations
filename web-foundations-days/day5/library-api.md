# Library API Design

A REST API for a library's **books** resource. All requests and responses use JSON.

A book looks like this:

```json
{
  "id": 1,
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "year": 1958,
  "isbn": "978-0385474542",
  "available": true
}
```

## Endpoints

### 1. List all books
- **Method:** `GET`
- **Path:** `/books`
- **Description:** Returns every book in the library.
- **Request body:** none
- **Success status:** `200 OK`

### 2. Get one book
- **Method:** `GET`
- **Path:** `/books/{id}`
- **Description:** Returns the book with the given id.
- **Request body:** none
- **Success status:** `200 OK`

### 3. Create a book
- **Method:** `POST`
- **Path:** `/books`
- **Description:** Adds a new book to the library.
- **Example request body:**

```json
{
  "title": "Weep Not, Child",
  "author": "Ngugi wa Thiong'o",
  "year": 1964,
  "isbn": "978-0435908300"
}
```

- **Success status:** `201 Created`

### 4. Update a book
- **Method:** `PUT`
- **Path:** `/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**

```json
{
  "title": "Weep Not, Child",
  "author": "Ngugi wa Thiong'o",
  "year": 1964,
  "isbn": "978-0435908300",
  "available": false
}
```

- **Success status:** `200 OK`

### 5. Delete a book
- **Method:** `DELETE`
- **Path:** `/books/{id}`
- **Description:** Removes the book from the library.
- **Request body:** none
- **Success status:** `204 No Content`

### 6. List books by an author
- **Method:** `GET`
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Returns only the books written by the given author, using the `author` query parameter.
- **Request body:** none
- **Success status:** `200 OK`

## Error codes

### 400 Bad Request
The request is invalid or missing required data.
- **Example:** `POST /books` with a body that has no `title`, or with `"year": "abc"` instead of a number.
- **Example response:**

```json
{ "error": "title is required" }
```

### 404 Not Found
The requested book does not exist.
- **Example:** `GET /books/9999` when no book has the id 9999.
- **Example response:**

```json
{ "error": "Book not found" }
```
