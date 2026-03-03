import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import { generateFormFields } from '~/services/ai-agent.server'
import { requireUserId } from '~/utils/session.server'

// Resource route — no UI export, action only
export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request)

  if (!process.env.OPENAI_API_KEY) {
    return json({ error: 'AI not configured' }, { status: 503 })
  }

  const body = (await request.json()) as { description?: string }
  const description = body.description?.trim()

  if (!description) {
    return json({ error: 'Description is required' }, { status: 400 })
  }

  try {
    const fields = await generateFormFields(description)
    return json({ fields })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI service unavailable'
    return json({ error: message }, { status: 500 })
  }
}
