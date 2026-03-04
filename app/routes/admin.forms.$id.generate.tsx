import type { ActionFunctionArgs } from '@remix-run/node'
import { data } from '@remix-run/node'

import { generateFormFields } from '~/services/ai-agent.server'
import { requireUserId } from '~/utils/session.server'

// Resource route — no UI export, action only
export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request)

  if (!process.env.OPENAI_API_KEY) {
    return data({ error: 'AI not configured' }, { status: 503 })
  }

  const body = (await request.json()) as { description?: string }
  const description = body.description?.trim()

  if (!description) {
    return data({ error: 'Description is required' }, { status: 400 })
  }

  try {
    const fields = await generateFormFields(description)
    return { fields }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI service unavailable'
    return data({ error: message }, { status: 500 })
  }
}
