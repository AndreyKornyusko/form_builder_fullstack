import type { AgentContext } from '~/types/agent-context'

/**
 * Converts an AgentContext object into a multi-line string
 * suitable for injection into a ChatPromptTemplate `{context}` slot.
 *
 * Kept as a separate utility so the serialization format can change
 * independently of the AgentContext shape or the prompt template structure.
 */
export function serializeAgentContext(ctx: AgentContext): string {
  const capabilitiesList = ctx.capabilities.map((c) => `  - ${c}`).join('\n')
  const constraintsList = ctx.constraints.map((c) => `  - ${c}`).join('\n')

  return [
    `Role: You are a ${ctx.role}.`,
    ``,
    `Capabilities:`,
    capabilitiesList,
    ``,
    `Output format: Return ${ctx.outputFormat}.`,
    ``,
    `Constraints:`,
    constraintsList,
  ].join('\n')
}
