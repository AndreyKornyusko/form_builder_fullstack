# /run-checks — Run All Quality Checks

Run all quality checks and fix any errors found.

## Steps

1. Run TypeScript check: `yarn typecheck`
2. Run ESLint: `yarn lint`
3. If errors found — fix them immediately, then re-run checks
4. Report final status: PASS or FAIL with details

## Rules

- Never use `// @ts-ignore` or `// eslint-disable` as a fix
- Fix the actual root cause of each error
- If a fix introduces new errors, resolve those too
- Do not change functionality while fixing type/lint errors
