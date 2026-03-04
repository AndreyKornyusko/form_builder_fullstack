# /review-spec — Review Spec Against Implementation

Spawn the `spec-checker` subagent to verify implementation compliance.
Usage: `/review-spec 01-auth`

---

## Steps

1. Read `specs/$ARGUMENTS.md` completely
2. Identify files related to this spec (read `## Implementation Notes` if present)
3. Read all relevant source files
4. Spawn the `spec-checker` subagent using the `Agent` tool:

```
Agent(
  subagent_type: "spec-checker",
  prompt: "
    Check compliance of the following spec against the implementation.

    SPEC (specs/$ARGUMENTS.md):
    [paste full spec content here]

    FILES TO CHECK:
    [list all relevant file paths]

    FILE CONTENTS:
    [paste content of each file]

    Follow the process defined in your system prompt exactly.
    Output the full compliance report.
  "
)
```

5. Show the agent's compliance report to the user
6. If **NEEDS WORK** or **BLOCKED**:
   - List what needs to be fixed
   - Ask the user whether to fix immediately or track as follow-up
