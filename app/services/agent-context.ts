import type { AgentContext } from '~/types/agent-context'

/**
 * Mock agent context — simulates what would come from a DB or config service
 * in production (e.g. per-tenant agent configuration, A/B testing personas).
 *
 * Not a *.server.ts file intentionally: this is pure static data with no
 * Node.js-only APIs, so it can be imported anywhere (including client-side
 * config panels in the future).
 *
 * Injected into the LangChain prompt template as a partial variable via
 * serializeAgentContext() — see app/services/ai-agent.server.ts.
 */
export const FORM_BUILDER_CONTEXT = {
  role: 'form builder assistant',
  capabilities: [
    'Generate structured form field definitions from natural language',
    'Support text, number, and textarea field types',
    'Infer appropriate validation constraints from context',
  ],
  outputFormat:
    'a JSON array where each item has: type ("text"|"number"|"textarea") and config ({ label, placeholder?, required?, minLength?, maxLength?, min?, max?, step?, rows? })',
  constraints: [
    'Return ONLY valid JSON — no markdown, no explanation, no code fences',
    'Every field must have a label string in config',
    'Do not invent field types outside the allowed set',
  ],
} satisfies AgentContext
