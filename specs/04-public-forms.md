# Spec 04 — Public Forms

## Status: IMPLEMENTED

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
Server-first, stateless components — no `value`/`onChange` (no client state required).
Use `name={field.id}` so native form POST sends `fieldId → value` pairs.
`defaultValue` repopulates input after a failed submission (server returns values back).

```typescript
interface FieldProps {
  field: FormField
  defaultValue?: string  // repopulate after server validation error
  error?: string         // from useActionData()
}
```

- `TextField` → MUI TextField (name=field.id, type="text", minLength/maxLength from config)
- `NumberField` → MUI TextField (name=field.id, type="number", inputProps with min/max/step)
- `TextareaField` → MUI TextField (name=field.id, multiline, rows from config)

No `useState` in the form fill page. Page submits via Remix `<Form method="post">` and
works without JavaScript (progressive enhancement).

## Server-side Validation
- Read all values from formData: `formData.get(fieldId)`
- Check required fields (config.required === true)
- On failure: return `json({ errors: { [fieldId]: message }, values: { [fieldId]: string } }, { status: 400 })`
  — `errors` keyed by field ID, `values` sent back so inputs repopulate without JS
- On success: return `json({ success: true })` (no redirect — avoids PRG complexity for now)

## Acceptance Criteria
- [x] Public list shows only published forms
- [x] Direct URL to unpublished form returns 404
- [x] All 3 field types render correctly with config
- [x] Required field validation works (client-side label + server-side)
- [x] Successful submission shows confirmation message
- [x] Submission data saved to DB with correct structure
- [x] Page works without JavaScript (progressive enhancement)

## Implementation Notes
- **FieldProps** changed from controlled (`value`/`onChange`) to server-first (`name`/`defaultValue`)
- **Field components** (`TextField`, `NumberField`, `TextareaField`): pure render functions, zero hooks.
  Each uses `name={field.id}` → native HTML form POST sends `{ fieldId: value }` pairs.
  `defaultValue` repopulates inputs after a server validation error (works without JS too).
- **`_index.tsx`** replaced: was a temporary redirect to `/auth/login`; now the real public form list.
- **Loader** maps Prisma `FormField` → `EditorField` so no Prisma types leak to the client.
- **Action flow**: reads all field IDs from `form.fields`, checks `required` in config, returns
  `{ success, errors, values }`. On error: status 400 + values back for repopulation.
  On success: `{ success: true }` — component switches to confirmation view.
- **`forms.$id.tsx` ErrorBoundary** catches the 404 `throw new Response(...)` from the loader.
- Submission data stored as `{ [fieldId]: value }` JSON in `FormSubmission.data`.
