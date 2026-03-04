import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import type { AppLoadContext, EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'

import createEmotionCache from '~/utils/create-emotion-cache'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext
) {
  const cache = createEmotionCache()
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)

  const html = renderToString(
    <CacheProvider value={cache}>
      <RemixServer context={remixContext} url={request.url} />
    </CacheProvider>
  )

  const chunks = extractCriticalToChunks(html)
  const styleTags = constructStyleTagsFromChunks(chunks)

  // Inject emotion style tags directly into the HTML string right after the
  // insertion-point meta element. These are NOT React-controlled, so React
  // won't overwrite them on client-side navigation.
  const finalHtml = html.replace(
    '<meta name="emotion-insertion-point" content=""/>',
    `<meta name="emotion-insertion-point" content=""/>${styleTags}`
  )

  responseHeaders.set('Content-Type', 'text/html')

  return new Response(`<!DOCTYPE html>${finalHtml}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
