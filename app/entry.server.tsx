import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import type { AppLoadContext, EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'

import createEmotionCache from '~/utils/create-emotion-cache'
import { EmotionStylesContext } from '~/utils/emotion-styles-context'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext
) {
  const cache = createEmotionCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)

  // Pass 1: render to collect which emotion styles are used
  const pass1Html = renderToString(
    <EmotionStylesContext.Provider value={[]}>
      <CacheProvider value={cache}>
        <RemixServer context={remixContext} url={request.url} />
      </CacheProvider>
    </EmotionStylesContext.Provider>
  )

  const { styles } = extractCriticalToChunks(pass1Html)
  const emotionStyles = styles.filter((s) => s.css)

  // Pass 2: render again with styles in context so Layout renders them as
  // <style> elements — part of React's virtual DOM, no hydration mismatch
  const html = renderToString(
    <EmotionStylesContext.Provider value={emotionStyles}>
      <CacheProvider value={cache}>
        <RemixServer context={remixContext} url={request.url} />
      </CacheProvider>
    </EmotionStylesContext.Provider>
  )

  responseHeaders.set('Content-Type', 'text/html')

  return new Response(`<!DOCTYPE html>${html}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
