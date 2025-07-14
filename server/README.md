# Backend API

A RESTful API for managing blog posts with a revision-based content management system built with Bun, Elysia, and Drizzle ORM.

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

## Architecture Overview

### Core Concepts

**Posts**: Metadata containers that hold information like author, publish date, and a reference to the current published revision.

**Revisions**: Individual versions of content. Each revision contains the actual content (title, body, cover) and points to its parent revision, creating a history chain.

**Head**: The current published revision that users see. The post entity points to this revision.

**Drafts**: Any revision that is not part of the main published history chain. Multiple drafts can exist simultaneously, branching from any point in the history.

### Revision System

The system works like a simplified version control system:

1. **Linear History**: Published revisions form a linear chain through parent-child relationships
2. **Branching**: Drafts can branch off from any published revision
3. **Immutable History**: Published history never changes; reverts are done by creating new revisions
4. **Multiple Drafts**: Multiple people can work on different drafts simultaneously

### Staleness Detection

A draft is "stale" if its parent revision is not the current head. This happens when:
- Someone creates a draft from revision A
- Someone else publishes a different draft, making revision B the new head
- The first draft is now stale (based on old revision A instead of current head B)

## Authentication

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

## Workflow

### Basic Content Creation

1. **Create Post**: Creates a post with its first revision as the head
2. **Create Draft**: Branch from the current head to start editing
3. **Update Draft**: Make changes to the draft revision
4. **Accept Draft**: Make the draft the new head (publish)

### Collaborative Editing

Multiple drafts can exist simultaneously:
- Each draft branches from some point in the history
- Drafts can be created, updated, and deleted independently
- When accepting a draft, the system detects if it's stale
- Stale drafts can still be accepted but require manual confirmation

## REST API Endpoints

### Posts
- `GET /posts` - List all posts with draft summaries
- `POST /posts` - Create a new post with initial revision
- `GET /posts/:id` - Get post with current revision and draft summaries
- `DELETE /posts/:id` - Delete post and all its revisions

### Revisions & History
- `GET /posts/:id/history` - Get published revision history (linear chain)

### Drafts
- `POST /posts/:id/drafts` - Create new draft from current head
- `PATCH /posts/:id/drafts` - Update the latest draft
- `POST /posts/:id/drafts/:revisionId/accept` - Accept draft as new head
- `DELETE /posts/:id/drafts/:revisionId` - Delete specific draft

### Request/Response Examples

**Create Post:**
```json
POST /posts
{
  "title": "My Blog Post",
  "content": "Post content...",
  "cover": "https://example.com/cover.jpg",
  "authorId": "user123"
}
```

**List Posts Response:**
```json
[{
  "id": "post_123",
  "title": "My Blog Post",
  "publishedAt": "2023-01-01T00:00:00.000Z",
  "authorId": "user123",
  "drafts": [{
    "id": "rev_456",
    "title": "Updated Title",
    "createdBy": "user456",
    "createdAt": "2023-01-02T00:00:00.000Z",
    "isStale": false
  }]
}]
```

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
