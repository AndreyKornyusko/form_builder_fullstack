# /review-frontend — Frontend Code Review

Spawn the `frontend-reviewer` subagent to review React/MUI code.
Usage:
- `/review-frontend app/routes/admin._index.tsx`
- `/review-frontend app/components/form-editor/`
- `/review-frontend` — reviews all frontend files changed since last commit

---

## Steps

1. Determine files to review:
   - If `$ARGUMENTS` is a file → use that file
   - If `$ARGUMENTS` is a directory → glob all `*.tsx` files in it
   - If no argument → run `git diff --name-only HEAD` and filter for:
     `app/routes/*.tsx`, `app/components/**/*.tsx`

2. Read all target files using the `Read` tool

3. Spawn the `frontend-reviewer` subagent using the `Agent` tool:

```
Agent(
  subagent_type: "frontend-reviewer",
  prompt: "
    Review the following frontend files for bugs, anti-patterns,
    and MUI/Remix/SSR issues.

    SCOPE:
    - Review ONLY the React component (default export) and ErrorBoundary
    - Do NOT review loader/action functions (backend scope)
    - For route files: clearly label which section you're reviewing

    PROJECT CONVENTIONS (from CLAUDE.md):
    - MUI v5 components, sx prop for styles
    - Named exports for components
    - No DB calls or server imports in component files
    - TypeScript strict mode, no any
    - All user-facing text in English
    - InputLabelProps={{ shrink: true }} on all MUI TextFields (SSR fix)

    SKILLS TO APPLY (internalize these rules):
    [paste contents of .claude/skills/frontend-review.md]
    [paste contents of .claude/skills/mui-v5-patterns.md]

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
