# Spec 05 — AI Form Generator (Bonus)

## Status: IMPLEMENTED

## Scope
AI chat widget inside the form editor that generates form fields from a natural language description.
Uses OpenAI gpt-4o-mini. Only visible when OPENAI_API_KEY is set.

## Trigger
Available only on `/admin/forms/:id/edit` page.
Floating Action Button (FAB) "AI" in bottom-right corner opens the chat panel.

## Files to Create
```
app/services/ai-agent.server.ts           — OpenAI integration
app/routes/admin.forms.$id.generate.tsx   — resource route (POST only)
app/components/ai-chat/
  AiChatPanel.tsx     — drawer with chat UI
  AiChatButton.tsx    — FAB trigger
```

## services/ai-agent.server.ts API
```typescript
export type FieldSuggestion = {
  type: 'text' | 'number' | 'textarea'
  config: {
    label: string
    placeholder?: string
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    step?: number
    rows?: number
  }
}

export async function generateFormFields(description: string): Promise<FieldSuggestion[]>
```

## OpenAI Prompt Strategy
```
System: You are a form builder assistant. Given a description of a form,
return a JSON array of form fields. Each field must have:
- type: "text" | "number" | "textarea"
- config: { label, placeholder?, required?, ...type-specific options }
Return ONLY valid JSON, no markdown, no explanation.

User: {description}
```
- Model: `gpt-4o-mini`
- Max tokens: 1000
- Parse response with `JSON.parse()`, validate each field type

## Resource Route (POST /admin/forms/:id/generate)
```typescript
export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request)
  const { description } = await request.json()
  if (!OPENAI_API_KEY) return json({ error: 'AI not configured' }, { status: 503 })
  const fields = await generateFormFields(description)
  return json({ fields })
}
```

## UI — AiChatPanel
- MUI Drawer (anchor="right", width=380)
- Header: "AI Field Generator" + close button
- Textarea: "Describe the form you want to create..." (multiline, rows=4)
- "Generate" button (loading state during request)
- Generated fields shown as MUI List with field type icon + label
- "Add All Fields" button → calls `onAddFields(fields)` callback
- Error shown as MUI Alert

## Integration with FormEditor
- `FormEditor` passes `onAddFields` callback to `AiChatPanel`
- New fields appended to existing fields array
- Fields are persisted in DB before being added to editor (not optimistic)

## Error Handling
- OpenAI unavailable → `{ error: 'AI service unavailable' }`
- Invalid JSON in response → `{ error: 'Failed to parse AI response' }`
- Missing API key → `{ error: 'AI not configured' }` (503)
- All errors shown as MUI Alert in the panel

## Acceptance Criteria
- [x] FAB visible only when OPENAI_API_KEY is set
- [x] Panel opens/closes without affecting editor state
- [x] Description generates relevant field suggestions
- [x] "Add All Fields" appends fields to editor
- [x] Errors shown gracefully (no crash)
- [x] Auth required for generate endpoint

## Implementation Notes

### Two-fetcher pattern in AiChatPanel
`AiChatPanel` uses two separate `useFetcher` instances to keep concerns separated:
1. `generateFetcher` — POSTs `{ description }` to `/admin/forms/:id/generate` (resource route)
   - Returns `{ fields: FieldSuggestion[] }` or `{ error: string }`
   - Suggestions are displayed in a list for user review before committing
2. `addFetcher` — POSTs `{ intent: 'addFieldsBatch', fields }` to `/admin/forms/:id/edit`
   - Creates all fields in DB via `addFieldsBatch()` transaction
   - Returns `{ fields: EditorField[] }` with real DB IDs
   - On completion: calls `onAddFields(realFields)` then `onClose()`

### addFieldsBatch model function
Added to `app/models/fields.server.ts`. Queries current max order, then runs a single
`db.$transaction()` creating all fields with sequential order values. Returns `EditorField[]`
mapped via the shared `toEditorField()` helper.

### hasAiKey flag
Loader in `admin.forms.$id.edit.tsx` passes `hasAiKey: !!process.env.OPENAI_API_KEY` to the
client. `FormEditor` conditionally renders `AiChatButton` and `AiChatPanel` only when truthy.
The API key value never reaches the client — only the boolean presence flag.

### handleAiAddFields stability
Wrapped in `useCallback` with empty deps in `FormEditor` to prevent unnecessary re-renders of
`AiChatPanel` and avoid re-triggering the `useEffect` that watches `addFetcher.state`.
