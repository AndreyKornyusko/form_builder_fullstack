/**
 * Describes the agent's persona and behavioral constraints.
 *
 * In production this would be loaded from a DB or config service per user/tenant.
 * Here it is a static mock — injected into the LangChain prompt template as a
 * partial variable to demonstrate "behavior context as data" pattern.
 */
export type AgentContext = {
  /** The role the LLM is instructed to assume */
  role: string
  /** What the agent is capable of producing */
  capabilities: string[]
  /** Exact description of the expected output shape */
  outputFormat: string
  /** Hard constraints that must always appear regardless of user input */
  constraints: string[]
}
