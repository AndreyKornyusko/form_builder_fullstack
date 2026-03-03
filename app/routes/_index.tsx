import { redirect } from '@remix-run/node'

// Temporary redirect until spec 04 (public forms) is implemented
export async function loader() {
  return redirect('/auth/login')
}
