# /implement-spec — Implement a Feature Spec

Orchestrate the implementation of a spec using specialized subagents.
Usage: `/implement-spec 01-auth`

---

## Phase 1 — Analyze

1. Read `specs/$ARGUMENTS.md` completely
2. Identify which layers the spec touches:
   - **DB layer**: schema changes, new models, seed data → `db-agent`
   - **Backend layer**: routes, services, session, auth → `backend-agent`
   - **Frontend layer**: React components, MUI, UI logic → `frontend-agent`

---

## Phase 2 — Implement (spawn subagents)

### Rules for spawning
- Use the `Agent` tool with `subagent_type` matching the agent folder name
- Each agent gets an isolated context — pass ALL necessary info in the prompt
- Do NOT assume the agent knows anything about the project beyond what you tell it
- `db-agent` must finish before `backend-agent` starts (backend depends on models)
- `frontend-agent` and `backend-agent` can run in parallel if they don't share files

### What to include in each agent's prompt
```
- The full spec content (copy-paste from the spec file)
- The specific files it should create or modify
- Relevant excerpts from CLAUDE.md (conventions it must follow)
- Any output from a previous agent it depends on
```

### Agent responsibilities

**db-agent** — run first if spec has schema/model changes
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `app/models/*.server.ts`

**backend-agent** — run after db-agent
- `app/routes/*.tsx` (loader + action only)
- `app/services/*.server.ts`
- `app/utils/*.server.ts`

**frontend-agent** — can run parallel with backend-agent
- `app/components/**/*.tsx`
- `app/routes/*.tsx` (React component/UI only)

---

## Phase 3 — Spec Check

After all agents complete, use the `Agent` tool to spawn `spec-checker`:

```
Agent(
  subagent_type: "spec-checker",
  prompt: "Check compliance of specs/$ARGUMENTS.md against the implementation.
           Spec content: [paste spec]. Focus on these files: [list files created]"
)
```

- If result is **PASS** → proceed to Phase 4
- If result is **NEEDS WORK** → fix missing items yourself or re-run the relevant agent
- If result is **BLOCKED** → fix conflicts before proceeding

---

## Phase 4 — Code Review

Run reviewers in parallel using the `Agent` tool:

```
Agent(subagent_type: "backend-reviewer", prompt: "Review these files: [list]
      File contents: [paste contents]. Follow .claude/agents/backend-reviewer.md")

Agent(subagent_type: "frontend-reviewer", prompt: "Review these files: [list]
      File contents: [paste contents]. Follow .claude/agents/frontend-reviewer.md")
```

Fix all 🔴 Errors found. Track 🟡 Warnings.

---

## Phase 5 — Quality Checks

```bash
yarn typecheck && yarn lint
```

Fix all errors. Re-run until clean. Never use `// @ts-ignore` or `// eslint-disable`.

---

## Phase 6 — Update Spec & Commit

1. Add `## Implementation Notes` to `specs/$ARGUMENTS.md`:
   - Files created
   - Deviations from spec (with reason)
   - Known limitations

2. Commit:
```bash
git add .
git commit -m "feat: $ARGUMENTS — brief description"
```

---

## Hard Rules

- Never implement anything not in the spec — ask first
- Never skip Phase 3 (spec check) or Phase 5 (quality checks)
- Never commit if typecheck or lint fails
