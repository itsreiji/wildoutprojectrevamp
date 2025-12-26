# WildOut! API Documentation

This project uses a Serverless Key-Value API built on Supabase Edge Functions and a PostgreSQL KV table.

## Base URL
`/functions/v1/make-server-41a567c3`

## Authentication
All write operations (`POST`, `PUT`, `DELETE`) require a valid Supabase JWT token.
Header: `Authorization: Bearer <token>`

## Endpoints

### Hero Section
- `GET /hero`: Get hero content (Cached 60s)
- `PUT /hero`: Update hero content (Auth required)

### About Section
- `GET /about`: Get about content (Cached 60s)
- `PUT /about`: Update about content (Auth required)

### Events
- `GET /events`: List all events (Cached 60s)
- `GET /events/:id`: Get single event
- `POST /events`: Create event (Auth required)
- `PUT /events/:id`: Update event (Auth required)
- `DELETE /events/:id`: Delete event (Auth required)

### Team
- `GET /team`: List team members
- `POST /team`: Create team member (Auth required)
- `PUT /team/:id`: Update team member (Auth required)
- `DELETE /team/:id`: Delete team member (Auth required)

### Partners
- `GET /partners`: List partners
- `POST /partners`: Create partner (Auth required)
- `PUT /partners/:id`: Update partner (Auth required)
- `DELETE /partners/:id`: Delete partner (Auth required)

### Settings
- `GET /settings`: Get global settings
- `PUT /settings`: Update settings (Auth required)

## Data Validation
All inputs are validated using Zod schemas. Invalid requests return `400 Bad Request` with validation details.

## Caching
Public `GET` endpoints include `Cache-Control: public, max-age=60` to leverage CDN caching and reduce database load.
