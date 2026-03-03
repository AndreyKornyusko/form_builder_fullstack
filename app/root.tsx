import { CacheProvider } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import type { LinksFunction } from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react'

import createEmotionCache from '~/utils/create-emotion-cache'
import theme from '~/utils/theme'

// Client-side cache — same key as server so hydration styles match
const clientEmotionCache = createEmotionCache()

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <CacheProvider value={clientEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Outlet />
      </ThemeProvider>
    </CacheProvider>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  return (
    <html lang="uk">
      <head>
        <title>Помилка!</title>
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: 'Roboto, sans-serif', padding: '2rem' }}>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : 'Сталася неочікувана помилка'}
        </h1>
        <Scripts />
      </body>
    </html>
  )
}
