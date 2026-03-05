import { BaseOutputParser } from '@langchain/core/output_parsers'

import type { FieldConfig, FieldType } from '~/types/editor'

export type FieldSuggestion = {
  type: FieldType
  config: FieldConfig
}

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

/**
 * Custom LangChain output parser for FieldSuggestion arrays.
 *
 * Extends BaseOutputParser<T> — the same base class used by StringOutputParser,
 * JsonOutputParser, etc. By implementing parse() we plug into the LCEL chain
 * the same way any built-in parser does, but with domain-specific validation.
 *
 * The generic type parameter FieldSuggestion[] flows through the chain so that
 * chain.invoke() returns Promise<FieldSuggestion[]> with no type casting needed.
 *
 * lc_namespace is required by LangChain's internal serialization registry.
 */
export class FieldSuggestionParser extends BaseOutputParser<FieldSuggestion[]> {
  lc_namespace = ['form_builder', 'output_parsers', 'field_suggestion']

  /**
   * Called when LangChain injects format instructions into the prompt.
   * We rely on the AgentContext's outputFormat field for this instead,
   * so we return an empty string to avoid duplicate instructions.
   */
  getFormatInstructions(): string {
    return ''
  }

  async parse(text: string): Promise<FieldSuggestion[]> {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new Error('Failed to parse AI response')
    }

    if (!Array.isArray(parsed)) {
      throw new Error('AI response is not a JSON array')
    }

    // Agent returns [{_guidance: "..."}] when the description lacks field types.
    // Surface it directly as a user-facing error instead of "no valid fields".
    const guidance = parsed.find(
      (item): item is { _guidance: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>)._guidance === 'string'
    )
    if (guidance) {
      throw new Error(guidance._guidance)
    }

    const valid = parsed.filter(isValidSuggestion)
    if (valid.length === 0) {
      throw new Error('AI returned no valid fields')
    }

    return valid
  }
}
