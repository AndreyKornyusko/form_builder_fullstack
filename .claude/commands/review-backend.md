# /review-backend — Backend Code Review

Spawn the `backend-reviewer` subagent to review backend code.
Usage:
- `/review-backend app/routes/admin.forms.new.tsx`
- `/review-backend app/services/`
- `/review-backend` — reviews all files changed since last commit

---

## Steps

1. Determine files to review:
   - If `$ARGUMENTS` is a file → use that file
   - If `$ARGUMENTS` is a directory → glob all `*.server.ts` files in it
   - If no argument → run `git diff --name-only HEAD` and filter for:
     `app/routes/*.tsx`, `app/services/`, `app/models/`, `app/utils/*.server.ts`

2. Read all target files using the `Read` tool

3. Spawn the `backend-reviewer` subagent using the `Agent` tool:

```
Agent(
  subagent_type: "backend-reviewer",
  prompt: "
    Review the following backend files for auth holes, validation gaps,
    layer violations, and data integrity issues.

    PROJECT CONVENTIONS (from CLAUDE.md):
    - Server code in *.server.ts files only
    - DB access only through app/models/
    - Business logic in app/services/
    - requireUserId() in EVERY admin loader AND action
    - Return json({ errors }) for validation failures
    - ErrorBoundary required on every route

    SKILLS TO APPLY (internalize these rules):
    [paste contents of .claude/skills/backend-review.md]
    [paste contents of .claude/skills/security.md]

    FILES TO REVIEW:
    [for each file: filename + full content]

    Output the structured report with 🔴 / 🟡 / 🔵 findings per file.
    End with a summary table.
  "
)
```

4. Show the agent's report to the user

5. Fix all 🔴 Errors immediately
6. Run `yarn typecheck && yarn lint` after fixes
