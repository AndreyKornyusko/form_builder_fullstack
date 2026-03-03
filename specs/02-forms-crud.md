# Spec 02 — Forms CRUD (Admin)

## Status: IMPLEMENTED

## Scope
Admin panel CRUD for forms: list all, create new, delete, toggle publish status.
Form metadata editing (title, description) happens in the editor (spec 03).

## Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/admin` | GET | Dashboard: list all forms |
| `/admin/forms/new` | GET | New form page |
| `/admin/forms/new` | POST | Create form → redirect to editor |
| `/admin/forms/:id` | DELETE | Delete form |
| `/admin/forms/:id/publish` | POST | Toggle publish status |

## Files to Create
```
app/models/forms.server.ts      — Prisma queries
app/services/forms.server.ts    — business logic
app/routes/admin._index.tsx     — dashboard
app/routes/admin.forms.new.tsx  — create form page
```

## models/forms.server.ts API
```typescript
export async function getForms(): Promise<FormListItem[]>
export async function getFormById(id: string): Promise<Form | null>
export async function createForm(data: { title: string; description?: string }): Promise<Form>
export async function updateForm(id: string, data: { title?: string; description?: string }): Promise<Form>
export async function deleteForm(id: string): Promise<void>
export async function togglePublish(id: string): Promise<Form>

// Lean type for list view (no fields/submissions)
type FormListItem = {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  createdAt: Date
  _count: { fields: number; submissions: number }
}
```

## services/forms.server.ts API
```typescript
export async function listForms(): Promise<FormListItem[]>
export async function createNewForm(title: string, description?: string): Promise<Form>
export async function removeForm(id: string): Promise<void>
export async function publishForm(id: string): Promise<Form>
```

## Admin Dashboard UI (/admin)
- MUI Table with columns: Title, Fields, Status chip, Created At, Actions
- Status chip: "Published" (green) | "Draft" (default)
- Actions per row: "Edit" button → `/admin/forms/:id/edit`, publish toggle IconButton, delete IconButton
- Delete: confirm with MUI Dialog
- "Create Form" button (top right)
- Empty state: "No forms yet. Create your first one!"

## New Form Page UI (/admin/forms/new)
- MUI Card centered layout
- Title field (required, max 100 chars)
- Description field (optional, multiline, max 500 chars)
- "Cancel" button → back to `/admin`
- "Create & Open Editor" submit → redirects to `/admin/forms/:id/edit`

## Yup Validation Schema
```typescript
const formSchema = yup.object({
  title: yup.string().trim().min(1, 'Required').max(100).required(),
  description: yup.string().trim().max(500).optional(),
})
```

## Acceptance Criteria
- [x] Dashboard shows all forms with correct field/submission counts
- [x] Can create new form and get redirected to editor
- [x] Can delete form (with confirmation)
- [x] Can toggle publish status inline
- [x] Empty state shown when no forms
- [x] All admin routes protected by requireUserId
- [x] Validation errors shown on new form page

## Implementation Notes
- Delete and publish actions handled via `intent` field in `admin._index.tsx` action (single route, no extra resource routes)
- `useFetcher` used for delete/publish so table updates without full navigation
- `admin.tsx` added as shared layout — AppBar with "Form Builder" + "Logout" button wraps all `/admin/*` routes
- `admin.forms.new.tsx` — centered Card layout (inherits AppBar from layout), `minHeight: calc(100vh - 64px)` to account for AppBar height
- Submissions column added to dashboard table (not in original spec columns list but available from `_count`)
