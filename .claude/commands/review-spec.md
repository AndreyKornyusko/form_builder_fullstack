# /review-spec — Review Spec Against Implementation

Review how well the implementation matches the spec. Usage: `/review-spec 01-auth`

## Steps

1. Read `specs/$ARGUMENTS.md`
2. For each Acceptance Criterion, check if it's implemented:
   - Read the relevant source files
   - Mark: ✅ implemented | ❌ missing | ⚠️ partial
3. Check for deviations from spec (undocumented changes)
4. Check code quality against `CLAUDE.md` conventions
5. Output a summary report:

```
## Spec Review: $ARGUMENTS

### Acceptance Criteria
- [x] Criterion 1 ✅
- [ ] Criterion 2 ❌ — not implemented
- [~] Criterion 3 ⚠️ — partial: missing X

### Deviations
- ...

### Code Quality Issues
- ...

### Overall: PASS / NEEDS WORK
```
