import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { destroySession } from '~/utils/session.server'

export async function action({ request }: ActionFunctionArgs) {
  return destroySession(request)
}

// GET requests to /auth/logout redirect to login
export async function loader() {
  return redirect('/auth/login')
}
