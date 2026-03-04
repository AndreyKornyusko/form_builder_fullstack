import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'

export function loader({ request }: LoaderFunctionArgs) {
  throw json({ message: 'Not found' }, { status: 404 })
}

export default function SplatRoute() {
  return null
}
