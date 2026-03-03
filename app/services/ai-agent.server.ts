import OpenAI from 'openai'

import type { FieldConfig, FieldType } from '~/types/editor'

export type FieldSuggestion = {
  type: FieldType
  config: FieldConfig
}

const SYSTEM_PROMPT = `You are a form builder assistant. Given a description of a form, \
return a JSON array of form fields. Each field must have:
- type: "text" | "number" | "textarea"
- config: { label, placeholder?, required?, ...type-specific options }
  For type "text" or "textarea": minLength?, maxLength?
  For type "number": min?, max?, step?
  For type "textarea": rows? (default 4)
Return ONLY valid JSON array, no markdown, no explanation.`

function isValidSuggestion(f: unknown): f is FieldSuggestion {
  if (typeof f !== 'object' || f === null) return false
  const field = f as Record<string, unknown>
  return (
    ['text', 'number', 'textarea'].includes(field.type as string) &&
    typeof field.config === 'object' &&
    field.config !== null &&
    typeof (field.config as Record<string, unknown>).label === 'string'
  )
}

export async function generateFormFields(description: string): Promise<FieldSuggestion[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('AI not configured')

  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: description },
    ],
  })

  const content = response.choices[0]?.message?.content ?? ''

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('Failed to parse AI response')
  }

  if (!Array.isArray(parsed)) throw new Error('Failed to parse AI response')

  const valid = parsed.filter(isValidSuggestion)
  if (valid.length === 0) throw new Error('AI returned no valid fields')

  return valid
}
