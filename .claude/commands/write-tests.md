# /write-tests — Write Tests for a File or Feature

Spawn the `test-writer` subagent to write Vitest tests.
Usage:
- `/write-tests app/utils/validation.ts`
- `/write-tests app/models/forms.server.ts`
- `/write-tests app/services/auth.server.ts`
- `/write-tests app/routes/admin.forms.new.tsx`
- `/write-tests app/components/form-editor/FieldList.tsx`

---

## Steps

1. Check if Vitest is installed:
   ```bash
   grep -q '"vitest"' package.json && echo "installed" || echo "not installed"
   ```
   If NOT installed → stop. Show this message:
   > Vitest is not installed. Run: `yarn add -D vitest @testing-library/react @testing-library/jest-dom`
   > Then configure `vitest.config.ts` before writing tests.

2. Read `$ARGUMENTS` file completely

3. Check if a test file already exists next to the source:
   - `forms.server.ts` → look for `forms.server.test.ts`
   - `FieldList.tsx` → look for `FieldList.test.tsx`

4. Read `.claude/skills/testing.md` for patterns and setup

5. Spawn the `test-writer` subagent using the `Agent` tool:

```
Agent(
  subagent_type: "test-writer",
  prompt: "
    Write Vitest tests for the following file.

    TARGET FILE: $ARGUMENTS
    FILE CONTENT:
    [paste full content of the source file]

    EXISTING TEST FILE: [paste if exists, or 'none']

    TEST INFRASTRUCTURE:
    - test/setup.ts exists: [yes/no]
    - If yes, paste its content

    TESTING PATTERNS (internalize these):
    [paste contents of .claude/skills/testing.md]

    PROJECT CONVENTIONS:
    - Prisma is mocked globally via vi.mock in test/setup.ts
    - Use AAA pattern: Arrange / Act / Assert
    - Test behavior, not implementation
    - Place test file next to source file

    INSTRUCTIONS:
    - If test/setup.ts doesn't exist, create it first
    - If existing test file was provided, ADD tests (don't overwrite)
    - Cover: happy path, edge cases, error cases
    - Output the complete test file(s) to write
  "
)
```

6. Write the test file(s) the agent produced to disk
7. Run `yarn test [filename]` to verify they pass
