# Backend API

A RESTful API for managing blog posts with draft/publish workflow built with Bun, Elysia, and Drizzle ORM.

## Getting Started

### Installation

```bash
bun install
```

### Running the Server

```bash
bun run main.ts
```

The server will start on port 8000.

## Technology Stack

- **Runtime**: Bun
- **Framework**: Elysia
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Custom token system with encrypted tokens

## API Endpoints

### Authentication

All endpoints require authentication via the `Authorization` header:

```
Authorization: <encrypted_token>
```

To get a token, use the auth endpoint:

```
POST /auth
{
  "username": "your_username",
  "password": "your_password"
}
```

Response:
```json
{
  "id": "123",
  "username": "your_username",
  "token": "encrypted_token_here"
}
```

Use the returned token in the `Authorization` header for all subsequent requests.

### Posts

#### Create Post
```
POST /posts
```

Creates a new post with an initial draft version.

**Request Body:**
```json
{
  "title": "My Blog Post",
  "content": "Post content here..",
  "cover": "https://example.com/cover.jpg",
  "authorId": "user123"
}
```

**Response:** `201 Created`
```json
{
  "post": {
    "id": "post_123",
    "currentVersionId": "version_456",
    "authorId": "user123",
    "publishedAt": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "version": {
    "id": "version_456",
    "postId": "post_123",
    "version": 1,
    "status": "draft",
    "title": "My Blog Post",
    "content": "Post content here...",
    "cover": "https://example.com/cover.jpg",
    "createdBy": "user123",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Get Post
```
GET /posts/:id
```

Retrieves a post with its current version information.

**Response:** `200 OK`
```json
{
  "post": {
    "id": "post_123",
    "currentVersionId": "version_456",
    "authorId": "user123",
    "publishedAt": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "currentVersion": {
    "id": "version_456",
    "postId": "post_123",
    "version": 1,
    "status": "draft",
    "title": "My Blog Post",
    "content": "Post content here...",
    "cover": "https://example.com/cover.jpg",
    "createdBy": "user123",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "isDraft": true,
  "hasDraft": true
}
```

#### Get Post Status
```
GET /posts/:id/status
```

Returns the current status of a post.

**Response:** `200 OK`
```json
{
  "hasDraft": true,
  "hasPublished": false,
  "publishedAt": null
}
```

### Drafts

#### Get Current Draft
```
GET /posts/:id/draft
```

Retrieves the current draft version of a post.

**Response:** `200 OK` or `404 Not Found`

#### Create or Replace Draft
```
PUT /posts/:id/draft
```

Creates a new draft or completely replaces an existing draft.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "cover": "https://example.com/new-cover.jpg",
  "changeNote": "Major content revision"
}
```

**Response:** `200 OK` (updated) or `201 Created` (new)

#### Update Draft Partially
```
PATCH /posts/:id/draft
```

Updates specific fields of an existing draft.

**Request Body:**
```json
{
  "title": "Just updating the title"
}
```

**Response:** `200 OK` or `404 Not Found`

#### Delete Draft
```
DELETE /posts/:id/draft
```

Deletes the current draft version.

**Response:** `204 No Content` or `404 Not Found`

#### Create Draft from Published
```
POST /posts/:id/draft/from-published
```

Creates a new draft based on the current published version.

**Response:** `201 Created` or `404 Not Found`

### Versions

#### Get All Versions
```
GET /posts/:id/versions
```

Retrieves all versions of a post, ordered by version number (newest first).

**Response:** `200 OK`
```json
[
  {
    "id": "version_789",
    "postId": "post_123",
    "version": 2,
    "status": "draft",
    "title": "Updated Title",
    "content": "Updated content...",
    "createdBy": "user123",
    "createdAt": "2023-01-02T00:00:00.000Z"
  },
  {
    "id": "version_456",
    "postId": "post_123",
    "version": 1,
    "status": "published",
    "title": "My Blog Post",
    "content": "Post content here...",
    "createdBy": "user123",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Get Published Version
```
GET /posts/:id/published
```

Retrieves the currently published version of a post.

**Response:** `200 OK` or `404 Not Found`

#### Get Working Version
```
GET /posts/:id/working
```

Retrieves the "working" version - the draft if it exists, otherwise the published version.

**Response:** `200 OK`
```json
{
  "version": {
    "id": "version_789",
    "postId": "post_123",
    "version": 2,
    "status": "draft",
    "title": "Updated Title",
    "content": "Updated content...",
    "createdBy": "user123",
    "createdAt": "2023-01-02T00:00:00.000Z"
  },
  "isDraft": true
}
```

### Publishing

#### Publish Draft
```
POST /posts/:id/publish
```

Publishes the current draft version and updates the post's published status.

**Response:** `200 OK` or `404 Not Found`

## Workflow

The API supports a draft/publish workflow:

1. **Create Post**: Creates a post with an initial draft
2. **Edit Draft**: Update the draft as needed using `PUT` or `PATCH`
3. **Publish**: Publish the draft to make it live
4. **Create New Draft**: Create a new draft from the published version to make further changes
5. **Repeat**: Continue the draft/publish cycle

### Version Management

- Each post can have multiple versions
- Only one draft version can exist per post at a time
- Published versions are immutable
- The `currentVersionId` on the post always points to the published version (or the initial draft if never published)

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `401 Unauthorized` - Authentication required or invalid
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a descriptive message:

```json
"No draft found to update"
```
