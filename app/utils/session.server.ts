import { createCookieSessionStorage, redirect } from '@remix-run/node'

import { SESSION_SECRET } from '~/utils/env.server'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    sameSite: 'lax',
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
})

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'))
}

export async function createUserSession(userId: string, redirectTo: string): Promise<Response> {
  const session = await sessionStorage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
  })
}

export async function destroySession(request: Request): Promise<Response> {
  const session = await getSession(request)
  return redirect('/auth/login', {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  })
}

export async function requireUserId(request: Request): Promise<string> {
  const session = await getSession(request)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') {
    throw redirect('/auth/login')
  }
  return userId
}
