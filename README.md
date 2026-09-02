# 🌱 Bloom — a todo app

A full-stack to-do app with per-user accounts: React + Tailwind on the frontend, a Spring Boot REST API on the backend, PostgreSQL for storage, and JWT-based authentication so every user only ever sees their own todos.

**Live demo:** _(coming soon — see the Deployment section)_

## Features

- Register / log in with a username and password (passwords hashed with BCrypt, sessions handled via JWT)
- Create, edit, complete, and delete todos
- Optional due date and free-form tags per todo, with color-coded due-date badges (overdue / today / upcoming) and a progress bar
- Todos are scoped per user — the API rejects attempts to read or modify someone else's todo
- A clean, pastel UI built with Tailwind CSS — a small custom design system (soft accent colors, one card style, toast notifications) instead of browser defaults and `alert()`

## Tech stack

| | |
|---|---|
| Frontend | React 19, React Router, Tailwind CSS, Yup validation |
| Backend | Java 17, Spring Boot 3, Spring Security, Spring Data JPA |
| Auth | JWT (jjwt), BCrypt password hashing |
| Database | PostgreSQL |
| Testing | React Testing Library (frontend), JUnit/Spring Boot Test (backend) |

## Project structure

```
todo-project-main/
├── backend/    Spring Boot REST API
└── frontend/   React app
```

## Running locally

You'll need Java 17+, Node 18+, and a local PostgreSQL instance.

### 1. Database

Create a database and (optionally) a user for the app:

```sql
CREATE DATABASE todo_app_db;
```

### 2. Backend

```bash
cd backend
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/todo_app_db
export SPRING_DATASOURCE_USERNAME=your_postgres_user
export SPRING_DATASOURCE_PASSWORD=your_postgres_password
export APP_JWT_SECRET=any-long-random-string-at-least-32-characters
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`. Hibernate creates the schema automatically on first run (`ddl-auto=update`) — there's no separate migration step yet.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

The app opens on `http://localhost:3000` and talks to the backend at `http://localhost:8080` by default. To point it elsewhere, set `REACT_APP_API_URL` (e.g. in a `.env.local` file) before running `npm start` or `npm run build`.

## Configuration reference

All backend config is read from environment variables, with local-friendly defaults baked in (see `backend/src/main/resources/application.properties`):

| Variable | Purpose | Local default |
|---|---|---|
| `SPRING_DATASOURCE_URL` | Postgres JDBC URL | `jdbc:postgresql://localhost:5432/todo_app_db` |
| `SPRING_DATASOURCE_USERNAME` | Postgres username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Postgres password | _(empty)_ |
| `APP_JWT_SECRET` | Secret used to sign JWTs — **must** be overridden with a long random value in any real deployment | a dev-only placeholder |
| `APP_JWT_EXPIRATION_MS` | How long a token stays valid, in ms | `86400000` (24h) |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated list of origins allowed to call the API | `http://localhost:3000` |
| `PORT` | Port the API listens on | `8080` |

The frontend reads one build-time variable:

| Variable | Purpose | Local default |
|---|---|---|
| `REACT_APP_API_URL` | Base URL of the backend API | `http://localhost:8080` |

## API overview

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in, returns `{ token, username }` |
| GET | `/api/todos` | Yes | List the current user's todos (optional `?tag=` filter) |
| POST | `/api/todos` | Yes | Create a todo |
| PUT | `/api/todos/{id}` | Yes | Update a todo |
| DELETE | `/api/todos/{id}` | Yes | Delete a todo |

Authenticated requests send `Authorization: Bearer <token>`, using the token returned by `/api/auth/login`.

## Deployment

- **Backend + database:** [Render](https://render.com) — a web service running the Spring Boot API plus a managed Postgres instance. Set the environment variables from the table above in the Render dashboard (in particular `APP_JWT_SECRET` and `APP_CORS_ALLOWED_ORIGINS`).
- **Frontend:** [Vercel](https://vercel.com), with `REACT_APP_API_URL` pointing at the Render backend's URL.

## Known limitations

- No database migration tool (Flyway/Liquibase) yet — schema changes rely on Hibernate's `ddl-auto=update`, which is fine for a demo but not for production data.
- The free tier of the backend host may spin down after inactivity, so the very first request after a while can take a few seconds to wake it up.

## License

MIT
