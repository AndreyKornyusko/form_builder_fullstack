# Agent-Driven Development — Form Builder

This document explains the agent architecture of the project and how to work with it correctly.

---

## Concept

Development is organized around **specialized AI agents**, each responsible for its own area. The main agent (Claude Code) acts as an **orchestrator** — it reads commands, spawns subagents, collects results, and fixes errors.

```
You (developer)
    │
    │ slash command or request
    ▼
Main agent (orchestrator)
    │
    ├──► db-agent          (schema, models)
    ├──► backend-agent     (routes, services)
    ├──► frontend-agent    (components, UI)
    ├──► spec-checker      (compliance check)
    ├──► backend-reviewer  (code review)
    ├──► frontend-reviewer (code review)
    └──► test-writer       (tests)
```

**Key property:** every subagent has an **isolated context**. It does not see your conversation with the main agent. It only receives what the orchestrator explicitly passes in its prompt.

---

## File Architecture

```
.claude/
  agents/                    ← system prompts for subagents
    db-agent.md              — schema, prisma, models
    backend-agent.md         — routes, services, session
    frontend-agent.md        — react components, MUI
    spec-checker.md          — spec compliance verification
    backend-reviewer.md      — backend code review
    frontend-reviewer.md     — frontend code review
    test-writer.md           — test writing

  commands/                  ← slash command templates for the orchestrator
    implement-spec.md        — /implement-spec
    review-spec.md           — /review-spec
    review-backend.md        — /review-backend
    review-frontend.md       — /review-frontend
    write-tests.md           — /write-tests
    run-checks.md            — /run-checks

  skills/                    ← reference guides (read by agents before working)
    remix-patterns.md
    typescript-strict.md
    prisma-patterns.md
    mui-v5-patterns.md
    security.md
    backend-review.md
    frontend-review.md
    testing.md

specs/                       ← feature specifications (source of truth)
  01-auth.md
  02-forms-crud.md
  03-form-editor.md
  04-public-forms.md
  05-ai-agent.md
  06-database-schema.md
```

---

## Agents — Who Does What

### Implementer Agents (write code)

| Agent | Files | Dependencies |
|-------|-------|--------------|
| `db-agent` | `prisma/schema.prisma`, `prisma/seed.ts`, `app/models/` | Runs first |
| `backend-agent` | `app/routes/` (loader/action), `app/services/`, `app/utils/*.server.ts` | After db-agent |
| `frontend-agent` | `app/components/`, `app/routes/` (React component) | Parallel with backend |
| `test-writer` | `*.test.ts`, `*.test.tsx` | After implementers |

### Reviewer Agents (report only, never write code)

| Agent | Reviews | Does NOT review |
|-------|---------|-----------------|
| `spec-checker` | Spec compliance | Code quality |
| `backend-reviewer` | Auth, validation, layers, security | JSX, components |
| `frontend-reviewer` | MUI, SSR, hooks, types | loader/action |

### Reviewer Isolation Rule
Reviewer agents **never fix** issues they find. They only report. The main agent (orchestrator) decides what to fix.

---

## Slash Commands

### `/implement-spec <spec-name>`
Full implementation cycle for a spec with automatic spawning of all required agents.

```bash
/implement-spec 01-auth
/implement-spec 03-form-editor
```

**What happens:**
1. Analyze spec → determine which agents to spawn
2. `db-agent` → schema + models (if needed)
3. `backend-agent` + `frontend-agent` → implementation (parallel where possible)
4. `spec-checker` → compliance check
5. `backend-reviewer` + `frontend-reviewer` → code review (parallel)
6. Fix errors → `yarn typecheck && yarn lint`
7. Update spec + git commit

### `/review-spec <spec-name>`
Check whether the implementation matches the specification.

```bash
/review-spec 01-auth
/review-spec 02-forms-crud
```

Spawns `spec-checker` subagent. Returns a table with ✅ / ⚠️ / ❌ per criterion.

### `/review-backend [file or directory]`
Code review of backend code.

```bash
/review-backend app/routes/admin.forms.new.tsx
/review-backend app/services/
/review-backend                    # all changed files (git diff)
```

Spawns `backend-reviewer` subagent. Returns a 🔴 / 🟡 / 🔵 report.

### `/review-frontend [file or directory]`
Code review of frontend code.

```bash
/review-frontend app/components/form-editor/FormEditor.tsx
/review-frontend app/components/
/review-frontend                   # all changed files (git diff)
```

Spawns `frontend-reviewer` subagent. Returns a 🔴 / 🟡 / 🔵 report.

### `/write-tests <file>`
Write Vitest tests for a specific file.

```bash
/write-tests app/utils/validation.ts
/write-tests app/models/forms.server.ts
/write-tests app/services/auth.server.ts
```

Spawns `test-writer` subagent. Outputs the ready test file.

### `/run-checks`
Run TypeScript + ESLint. Fixes all errors.

```bash
/run-checks
```

Does not spawn agents — runs directly.

---

## Recommended Workflow

### New spec (full cycle)

```
1. /implement-spec 02-forms-crud
   → automatically runs all phases

2. /review-spec 02-forms-crud
   → final compliance check

3. /write-tests app/services/forms.server.ts
   → tests for critical services

4. /run-checks
   → final quality gate

5. git push origin main
```

### Reviewing existing code

```
# Check whether an old implementation matches the spec
/review-spec 01-auth

# Code review after changes
/review-backend app/routes/admin.tsx
/review-frontend app/components/form-editor/

# Write tests for a new service
/write-tests app/services/forms.server.ts
```

### Debugging after spec-checker failure

```
/review-spec 03-form-editor    # finds what is not implemented

# If spec-checker reports ❌ for a specific criterion,
# describe the problem to the main agent:

"spec-checker says criterion 4 (drag-and-drop reorder) is not implemented.
Help implement it according to the spec."
```

---

## How Agents Receive Context

A subagent **does not see** your conversation. It only sees the `prompt` from the orchestrator.

The orchestrator always passes to the agent:
- Full spec content or the relevant file
- Project conventions (from CLAUDE.md)
- Contents of relevant skills files
- File contents for analysis (for reviewers)

**Implication:** if an agent did something wrong — check what the orchestrator passed in the prompt. That is usually where the problem is.

---

## Parallel Agent Execution

The orchestrator can run multiple agents at the same time:

```
# Parallel (independent tasks):
backend-reviewer  ──┐
frontend-reviewer ──┘  → both start simultaneously

# Sequential (dependent tasks):
db-agent → backend-agent → spec-checker → reviewers
```

Agents writing to **different files** — can run in parallel.
Agents where one **depends on the output** of another — run sequentially.

---

## Agent Limitations

| Limitation | Reason |
|------------|--------|
| Agent cannot see git history | Isolated context |
| Agent does not know what other agents did | Each starts fresh |
| Reviewer does not fix — only reports | Avoids breaking other agents' work |
| db-agent runs first | Backend depends on models |

---

## Agent Report Formats

### spec-checker
```
✅ Criterion N — implemented (with code reference)
⚠️ Criterion N — partial (what is missing)
❌ Criterion N — not implemented
🔴 Conflict    — code contradicts spec
```

### backend-reviewer / frontend-reviewer
```
🔴 Error      — blocks merge (auth hole, security, crash)
🟡 Warning    — should fix (bad pattern, potential bug)
🔵 Suggestion — optional improvement
```

**Overall:** `PASS` / `NEEDS WORK` / `BLOCKED`
