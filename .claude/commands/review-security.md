# /review-security — Full-Stack Security Audit

Spawn the `security-reviewer` subagent to audit the project for security vulnerabilities.
Usage:
- `/review-security` — audit all files changed since last commit
- `/review-security app/routes/` — audit a specific directory
- `/review-security app/utils/session.server.ts` — audit a specific file
- `/review-security --full` — audit the entire codebase (all routes, services, models, utils, components)

---

## Steps

1. Determine files to review:
   - If `$ARGUMENTS` is `--full` → glob all files:
     `app/routes/**/*.tsx`, `app/services/**/*.server.ts`, `app/models/**/*.server.ts`,
     `app/utils/**/*.server.ts`, `app/components/**/*.tsx`, `prisma/schema.prisma`
   - If `$ARGUMENTS` is a file → use that file
   - If `$ARGUMENTS` is a directory → glob all `*.tsx` and `*.server.ts` in it
   - If no argument → run `git diff --name-only HEAD` and include all changed files
     across `app/routes/`, `app/services/`, `app/models/`, `app/utils/`, `app/components/`

2. Also always include (regardless of scope):
   - `app/utils/session.server.ts` — session/cookie config
   - `.env.example` — secrets management check

3. Read all target files using the `Read` tool

4. Read the security skills file: `.claude/skills/security.md`

5. Spawn the `security-reviewer` subagent using the `Agent` tool:

```
Agent(
  subagent_type: "security-reviewer",
  prompt: "
    Perform a full security audit on the following files from the Form Builder project.

    PROJECT CONVENTIONS (from CLAUDE.md):
    - All admin routes must call requireUserId(request) in EVERY loader AND action
    - No raw SQL — all DB access through Prisma in app/models/
    - Input validated with Yup before any DB call
    - Session cookie: httpOnly, sameSite lax, secure in prod
    - Error messages: log server-side, show generic message to user
    - AI agent: OpenAI API key from env only, LLM output validated before DB insert
    - No dangerouslySetInnerHTML with user content
    - All secrets loaded from environment variables (never hardcoded)

    SECURITY CHECKLIST (internalize all rules):
    [paste contents of .claude/skills/security.md]

    FILES TO AUDIT:
    [for each file: filename + full content]

    Check against OWASP Top 10 (A01–A10).
    Output the structured security report with 🔴 BLOCKED / 🔴 Errors / 🟡 Warnings / 🔵 Suggestions.
    Include OWASP category reference for each finding.
    End with a summary table and overall verdict: PASS / NEEDS WORK / BLOCKED.
  "
)
```

6. Show the agent's report to the user

7. Fix all 🔴 BLOCKED and 🔴 Errors immediately

8. Run `yarn typecheck && yarn lint` after fixes

9. If any BLOCKED items were fixed, run `/review-security` again to confirm resolution
