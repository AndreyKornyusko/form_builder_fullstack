# Spec 03 — Form Editor

## Status: IMPLEMENTED

## Scope
The main admin editor screen. Split layout: field list + live preview + settings sidebar.

## Route
`/admin/forms/:id/edit`

## Layout
```
┌─────────────────────────────────────────────────────┐
│  Header: Form title | Save | Back to list           │
├──────────────┬──────────────────┬───────────────────┤
│  LEFT PANEL  │  CENTER: PREVIEW │  RIGHT: SIDEBAR   │
│  Field List  │                  │  (settings)       │
│              │  [Field 1]       │                   │
│  + Add Text  │  [Field 2]       │  Click field to   │
│  + Add Number│  [Field 3]       │  open settings    │
│  + Add Area  │                  │                   │
└──────────────┴──────────────────┴───────────────────┘
```

## Left Panel — Field List
- Ordered list of fields (drag-to-reorder — use @hello-pangea/dnd or simple up/down buttons)
- Each item shows: field type icon + label
- Click → selects field (highlights in preview + opens sidebar)
- Delete button per field
- "Add field" buttons at bottom: + Text, + Number, + Textarea

## Center — Form Preview
- Renders actual MUI form fields (non-interactive for editing purpose)
- Clicking a field → selects it (same as clicking in left panel)
- Selected field has highlighted border

## Right Sidebar — Field Settings
- Shows settings for currently selected field
- Empty state if no field selected: "Select a field to configure"

### Text field settings
- Label (text input, required)
- Placeholder (text input)
- Required (checkbox)
- Min Length (number input)
- Max Length (number input)

### Number field settings
- Label (text input, required)
- Placeholder (text input)
- Required (checkbox)
- Min (number input)
- Max (number input)
- Step (number input)

### Textarea field settings
- Label (text input, required)
- Placeholder (text input)
- Required (checkbox)
- Min Length (number input)
- Max Length (number input)
- Rows (number input, default 4)

## Save Behavior
- "Save" button calls action to persist all fields
- Auto-save on field config change (debounced 1s) — optional, nice-to-have
- Show toast/snackbar on save success/error

## Components to Create
```
app/components/form-editor/
  FormEditor.tsx          — main layout component
  FieldList.tsx           — left panel
  FieldListItem.tsx       — single item in list
  FormPreview.tsx         — center preview
  FieldSettingsSidebar.tsx — right panel
  settings/
    TextFieldSettings.tsx
    NumberFieldSettings.tsx
    TextareaFieldSettings.tsx
```

## State Management
- Local React state for editor (selectedFieldId, fields array)
- On save → POST to action → Prisma update
- Optimistic UI on field config changes

## Fields Service Additions
```typescript
export async function updateFormFields(formId: string, fields: FormFieldInput[]): Promise<void>
export async function addField(formId: string, type: FieldType): Promise<FormField>
export async function deleteField(fieldId: string): Promise<void>
export async function reorderFields(formId: string, orderedIds: string[]): Promise<void>
```

## Acceptance Criteria
- [x] Can add text / number / textarea fields
- [x] Clicking field in list selects it and opens correct settings sidebar
- [x] Clicking field in preview also selects it
- [x] Settings changes reflect in preview in real time
- [x] Can delete a field
- [x] Can reorder fields
- [x] Save persists to DB
- [x] Navigating away and back — fields preserved

## Implementation Notes
- **Add field**: fetcher POST → server creates DB record → returns EditorField with real ID → appended to local state
- **Delete field**: removed from local state immediately + background fetcher POST to delete from DB
- **Reorder**: up/down buttons update local state only; order is persisted on Save
- **Config changes**: local state only (real-time preview); persisted on Save button click
- **Save**: POSTs all fields with `{ id, config, order }` — updates config AND order in a single DB transaction
- **Layout**: editor uses `height: calc(100vh - 64px)` to fill beneath admin AppBar; 3-column body is `flex: 1, overflow: hidden` with each column individually scrollable
- **types/editor.ts**: shared FieldType, TextConfig, NumberConfig, TextareaConfig, EditorField, SaveField types
- **models/fields.server.ts**: addField, deleteField, updateFields (replaces spec's reorderFields + updateFormFields)
- `reorderFields` action removed; order is saved as part of the `save` intent along with configs
