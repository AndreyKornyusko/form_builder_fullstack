# Form Builder

A system for creating and publishing forms with an admin panel and an AI assistant.

## Tech Stack
- RemixJS + TypeScript + Vite
- PostgreSQL + Prisma
- Material UI v5
- Yup validation
- Session-based auth
- OpenAI (bonus AI agent)

## Quick Start

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Install dependencies
yarn install

# 3. Setup environment
cp .env.example .env
# Edit DATABASE_URL and SESSION_SECRET

# 4. Setup database
yarn db:push
yarn db:seed

# 5. Start dev server
yarn dev
```

Admin: http://localhost:5173/admin  
Login: `admin@example.com` / `admin123`

Public: http://localhost:5173

## Agent-Driven Development

This project uses an AI agent architecture for development. Full documentation is in [`docs/AGENTS.md`](docs/AGENTS.md), including:
- Which agents exist and what they own (`db-agent`, `backend-agent`, `frontend-agent`, reviewers)
- All slash commands with examples (`/implement-spec`, `/review-spec`, `/review-frontend`, etc.)
- Recommended workflow: implement → review-spec → tests → checks → commit
- How agents receive context and their limitations

## Development with Claude Code

This project uses Spec-Driven Development. All feature specs are in `specs/`.

```bash
# Implement a feature
/implement-spec 01   # auth
/implement-spec 02   # forms CRUD
/implement-spec 03   # form editor
/implement-spec 04   # public forms
/implement-spec 05   # AI agent (bonus)

# Review implementation
/review-spec 01

# Run quality checks
/run-checks
```

## Project Structure
See `STRUCTURE.md` for full directory layout.

## Scripts
```bash
yarn dev          # Dev server
yarn build        # Production build
yarn db:push      # Apply Prisma schema
yarn db:seed      # Seed DB
yarn lint         # ESLint
yarn format       # Prettier
yarn typecheck    # TypeScript check
```
