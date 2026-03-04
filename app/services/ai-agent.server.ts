// LangChain refactor — educational replacement of the direct OpenAI SDK call.
//
// Before (direct SDK):
//   new OpenAI() → client.chat.completions.create() → JSON.parse() → filter()
//
// After (LCEL chain):
//   ChatPromptTemplate → ChatOpenAI → FieldSuggestionParser
//
// The public API (FieldSuggestion type + generateFormFields signature) is
// unchanged — the route admin.forms.$id.generate.tsx requires no modification.

import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'

import { FORM_BUILDER_CONTEXT } from '~/services/agent-context'
import { FieldSuggestionParser } from '~/utils/field-suggestion-parser'
import type { FieldSuggestion } from '~/utils/field-suggestion-parser'
import { serializeAgentContext } from '~/utils/serialize-agent-context'

// Re-export so callers (the route) continue to import FieldSuggestion from here
export type { FieldSuggestion } from '~/utils/field-suggestion-parser'

// ---------------------------------------------------------------------------
// 1. Prompt template
//
// Two message slots:
//   - system: {context} — the agent's persona, injected from FORM_BUILDER_CONTEXT
//   - human:  {description} — the user's form description, provided at runtime
//
// {context} is filled as a partial variable (known before any request arrives),
// analogous to currying a function. In production you would call .partial()
// with a context loaded from DB per user/tenant — the injection point is the
// same, only the data source changes.
// ---------------------------------------------------------------------------
const BASE_PROMPT = ChatPromptTemplate.fromMessages([
  ['system', '{context}'],
  ['human', '{description}'],
])

// ---------------------------------------------------------------------------
// 2. Output parser
//
// FieldSuggestionParser extends BaseOutputParser<FieldSuggestion[]>.
// It replaces the manual JSON.parse + isValidSuggestion filter from before.
// The TypeScript generic flows through the chain so chain.invoke() returns
// Promise<FieldSuggestion[]> with no casting.
// ---------------------------------------------------------------------------
const parser = new FieldSuggestionParser()

// ---------------------------------------------------------------------------
// 3. LCEL chain
//
// RunnableSequence.from([a, b, c]) composes three steps:
//   Step 1 — prompt: formats {context} + {description} into ChatMessages
//   Step 2 — model:  calls OpenAI, returns an AIMessage
//   Step 3 — parser: extracts text from AIMessage → JSON.parse → validate
//
// This is equivalent to prompt.pipe(model).pipe(parser) — the explicit
// RunnableSequence form makes the three-step structure visually clear.
//
// The chain is built inside the function so that:
//   a) the apiKey is read lazily at request time (not at module load)
//   b) the context partial is applied fresh each call — ready for future
//      per-request context injection (e.g. user-specific agent personas)
// ---------------------------------------------------------------------------
async function buildChain(apiKey: string) {
  // Apply the mock context as a partial variable.
  // .partial() returns a new prompt with {context} pre-filled;
  // chain.invoke() then only needs { description }.
  const prompt = await BASE_PROMPT.partial({
    context: serializeAgentContext(FORM_BUILDER_CONTEXT),
  })

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    apiKey,
    maxTokens: 1000,
  })

  return RunnableSequence.from([prompt, model, parser])
}

// ---------------------------------------------------------------------------
// 4. Public API — same signature as before
// ---------------------------------------------------------------------------
export async function generateFormFields(description: string): Promise<FieldSuggestion[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('AI not configured')

  const chain = await buildChain(apiKey)

  // Only {description} is passed — {context} was already applied via .partial()
  return chain.invoke({ description })
}
