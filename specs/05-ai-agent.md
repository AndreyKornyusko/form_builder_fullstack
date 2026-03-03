# Spec 05 — AI Form Generator (Bonus)

## Status: BACKLOG

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
  if (!OPENAI_API_KEY) return json({ error: 'AI не налаштовано' }, { status: 503 })
  const fields = await generateFormFields(description)
  return json({ fields })
}
```

## UI — AiChatPanel
- MUI Drawer (anchor="right", width=380)
- Header: "AI Генератор полів" + close button
- Textarea: "Опишіть форму..." (multiline, rows=4)
- "Згенерувати" button (loading state during request)
- Generated fields shown as MUI List with field type icon + label
- "Додати всі поля" button → calls `onAddFields(fields)` callback
- Error shown as MUI Alert

## Integration with FormEditor
- `FormEditor` passes `onAddFields` callback to `AiChatPanel`
- New fields appended to existing fields array
- Editor re-renders with new fields immediately (optimistic)

## Error Handling
- OpenAI unavailable → `{ error: 'AI сервіс недоступний' }`
- Invalid JSON in response → `{ error: 'Не вдалося розпарсити відповідь AI' }`
- Missing API key → `{ error: 'AI не налаштовано' }` (503)
- All errors shown as MUI Alert in the panel

## Acceptance Criteria
- [ ] FAB visible only when OPENAI_API_KEY is set
- [ ] Panel opens/closes without affecting editor state
- [ ] Description generates relevant field suggestions
- [ ] "Додати всі поля" appends fields to editor
- [ ] Errors shown gracefully (no crash)
- [ ] Auth required for generate endpoint
