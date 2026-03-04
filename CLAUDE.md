# CLAUDE.md — Form Builder Project

## Project Overview
Form Builder — a web application with admin panel (protected) and public part.
Built with RemixJS + TypeScript + PostgreSQL + Prisma + MUI.

## Tech Stack
- **Framework:** RemixJS (Vite bundler)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Session-based (remix sessions + bcrypt)
- **UI:** Material UI v5
- **Validation:** Yup (shared between client/server)
- **Package manager:** Yarn
- **Code quality:** ESLint + Prettier
- **Dev environment:** Docker Compose

## Project Conventions

### File naming
- Components: PascalCase (`FormEditor.tsx`)
- Routes: kebab-case following Remix conventions
- Utils/services: camelCase (`forms.server.ts`)
- Specs: `NN-feature-name.md`

### Code style
- Always use TypeScript strict types — no `any`
- Prefer named exports for components
- All server-side code in `*.server.ts` files (Remix convention)
- Yup schemas defined in `app/utils/validation.ts`, reused on client and server
- MUI components wrapped in local `app/components/ui/` if customized

### Language — English only
**All project text must be in English.** This applies to:
- All user-facing UI text and labels
- All code comments
- All documentation files (`docs/`, `specs/`, `.claude/`)
- Commit messages and PR descriptions
- Variable names, function names, error messages

No Ukrainian, no mixed language. English only, everywhere.

### Database
- All DB access through Prisma client in `app/models/`
- No raw SQL unless absolutely necessary
- Always handle Prisma errors explicitly

### Auth
- Session stored in cookie via `createCookieSessionStorage`
- Protected routes check session in loader, redirect to `/auth/login` if missing
- Admin routes prefixed with `/admin`

### Error handling
- Remix `ErrorBoundary` on every route
- Server errors logged, user-friendly messages shown
- Form validation errors returned via `json({ errors })` from action

## Spec-Driven Development Rules
1. **Never implement a feature without a spec** in `specs/` directory
2. Before coding, read the relevant spec file completely
3. If spec is ambiguous, ask for clarification before writing code
4. After implementing, update spec with `## Implementation Notes` section
5. Tests are defined in the spec — implement them alongside the feature

## Implementation Order
Follow specs in numerical order:
1. `specs/06-database-schema.md` — DB first
2. `specs/01-auth.md` — Auth second
3. `specs/02-forms-crud.md` — Core CRUD
4. `specs/03-form-editor.md` — Editor UI
5. `specs/04-public-forms.md` — Public part
6. `specs/05-ai-agent.md` — Bonus AI agent

## Directory Responsibilities
```
app/routes/        — Remix routes (loaders + actions + UI)
app/components/    — React components (UI only, no DB calls)
app/models/        — Prisma queries (DB layer)
app/services/      — Business logic (calls models, used by routes)
app/utils/         — Pure utilities, Yup schemas, helpers
prisma/            — Schema + migrations + seed
specs/             — All feature specifications (source of truth)
.claude/           — Claude Code configuration
```

## Commands Available
- `yarn dev` — start dev server
- `yarn build` — production build
- `yarn db:push` — push Prisma schema
- `yarn db:seed` — seed database
- `yarn lint` — ESLint check
- `yarn format` — Prettier format
- `docker-compose up -d` — start PostgreSQL

## Environment Variables
See `.env.example` for required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Random secret for sessions
- `OPENAI_API_KEY` — For AI agent (bonus feature)

## Git Workflow

After completing each spec implementation:
1. Run `yarn typecheck && yarn lint` — fix all errors first
2. Stage all changes: `git add .`
3. Commit with conventional format: `git commit -m "feat: [spec name] — brief description"`
4. Push to origin: `git push origin main`

Commit message format:
- feat: new feature (spec implementation)
- fix: bug fix
- chore: config, deps, tooling

Never commit if typecheck or lint fails.
```

## Agent Skills
Reference these before working on each area:
- `.claude/skills/remix-patterns.md` — loader/action patterns, optimistic UI, ErrorBoundary
- `.claude/skills/typescript-strict.md` — discriminated unions, Prisma types, type guards
- `.claude/skills/prisma-patterns.md` — singleton client, transactions, error codes
- `.claude/skills/mui-v5-patterns.md` — layout patterns, form fields, Snackbar, Dialog
- `.claude/skills/security.md` — auth guards, input validation, session config

## Agent Architecture
See `docs/AGENTS.md` for the full guide on:
- Which agents exist and what they own
- All slash commands with examples
- Recommended workflow (implement → review-spec → tests → checks → commit)
- How agents receive context and their limitations

