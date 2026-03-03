# Spec 04 — Public Forms

## Status: READY TO IMPLEMENT

## Scope
Public-facing pages (no auth): published form list and form fill with submission.

## Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | List of published forms |
| `/forms/:id` | GET | View and fill a specific form |
| `/forms/:id` | POST | Submit form data |

## Files to Create
```
app/routes/_index.tsx                  — public form list
app/routes/forms.$id.tsx               — form fill page
app/models/form-submissions.server.ts  — submission queries
app/components/form-fields/            — field renderers
  TextField.tsx
  NumberField.tsx
  TextareaField.tsx
```

## models/forms.server.ts Additions
```typescript
export async function getPublishedForms(): Promise<PublicForm[]>
export async function getPublishedFormWithFields(id: string): Promise<FormWithFields | null>

type PublicForm = { id: string; title: string; description: string | null }
type FormWithFields = Form & { fields: FormField[] }
```

## models/form-submissions.server.ts API
```typescript
export async function createSubmission(
  formId: string,
  data: Record<string, unknown>
): Promise<FormSubmission>
```

## Public Form List UI (/)
- MUI Grid of Cards
- Card: title, description (truncated 2 lines), field count, "Fill Out Form" button
- Only published forms shown
- Empty state: "No forms available at the moment"
- No auth required

## Form Fill Page UI (/forms/:id)
- Form title + description at top
- Each field rendered by type (using field components)
- "Submit" button
- On success → show MUI Alert "Form submitted successfully! Thank you." (replace form content)
- On error → show validation errors per field as `helperText`
- Return 404 if form not found OR not published

## Field Components (app/components/form-fields/)
Stateless, controlled components that render based on `config`:

```typescript
interface FieldProps {
  field: FormField
  value: string
  error?: string
  onChange: (fieldId: string, value: string) => void
}
```

- `TextField` → MUI TextField (type="text", minLength/maxLength from config)
- `NumberField` → MUI TextField (type="number", inputProps with min/max/step)
- `TextareaField` → MUI TextField (multiline, rows from config)

## Server-side Validation
- Check required fields (config.required === true)
- Return `json({ errors: { [fieldId]: message } }, { status: 400 })` on failure
- `errors` object keyed by field ID

## Acceptance Criteria
- [ ] Public list shows only published forms
- [ ] Direct URL to unpublished form returns 404
- [ ] All 3 field types render correctly with config
- [ ] Required field validation works (client-side label + server-side)
- [ ] Successful submission shows confirmation message
- [ ] Submission data saved to DB with correct structure
- [ ] Page works without JavaScript (progressive enhancement)
