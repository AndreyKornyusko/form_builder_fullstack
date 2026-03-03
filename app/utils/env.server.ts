function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export const SESSION_SECRET = getRequiredEnv('SESSION_SECRET')
export const DATABASE_URL = getRequiredEnv('DATABASE_URL')

// Optional — only needed for spec 05 (AI agent)
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
