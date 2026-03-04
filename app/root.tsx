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
import { useContext, useEffect } from 'react'

import { useClientStyle } from '~/utils/client-style-context'
import { EmotionStylesContext } from '~/utils/emotion-styles-context'
import theme from '~/utils/theme'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const emotionStyles = useContext(EmotionStylesContext)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {emotionStyles.map(({ key, ids, css }, i) => (
          <style
            // eslint-disable-next-line react/no-danger
            key={`${key}-${i}`}
            data-emotion={`${key} ${ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: css }}
          />
        ))}
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { reset } = useClientStyle()

  // Reset the Emotion cache once after hydration so its <style> element
  // is created and stable in the DOM before any client-side navigation.
  // Without this, the element is never created during SSR-hydration
  // (all styles are already in the SSR <style> tags), and admin-specific
  // styles fail to inject on the first client-side navigation.
  useEffect(() => {
    reset()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError()

  return (
    <html lang="en">
      <head>
        <title>Error!</title>
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: 'Roboto, sans-serif', padding: '2rem' }}>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : 'An unexpected error occurred'}
        </h1>
        <Scripts />
      </body>
    </html>
  )
}
