# /implement-spec — Implement a Feature Spec

Implement the spec file passed as argument. Usage: `/implement-spec 01-auth`

## Steps

1. Read `specs/$ARGUMENTS.md` completely before writing any code
2. Check `specs/00-architecture.md` for relevant architectural decisions
3. Implement ALL files listed in the spec's "Files to Create" section
4. Follow conventions from `CLAUDE.md` strictly:
   - TypeScript strict mode, no `any`
   - Server code in `*.server.ts`
   - DB access only through `app/models/`
   - Business logic in `app/services/`
5. After implementation, validate all Acceptance Criteria from the spec
6. Run `yarn typecheck && yarn lint` — fix all errors
7. Add `## Implementation Notes` section to the spec with:
   - Files actually created
   - Any deviations from spec and why
   - Known limitations
8. Commit: `git add . && git commit -m "feat: [spec name] — brief description"`

## Rules

- Do NOT implement anything not mentioned in the spec
- If the spec is ambiguous, ask for clarification before coding
- Import order: React → third-party → local (absolute) → relative
- All MUI components used directly (no custom wrappers unless spec says so)
