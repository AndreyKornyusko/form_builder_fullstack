import { CacheProvider } from '@emotion/react'
import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

import createEmotionCache from '~/utils/create-emotion-cache'
import type { EmotionCriticalChunk } from '~/utils/emotion-styles-context'
import { EmotionStylesContext } from '~/utils/emotion-styles-context'

// Read SSR-injected emotion <style> elements from the DOM before hydration.
// This gives the client the same context value the server used, so React's
// virtual DOM matches the real DOM — no hydration mismatch.
const emotionStyles: EmotionCriticalChunk[] = Array.from(
  document.querySelectorAll<HTMLStyleElement>('style[data-emotion]')
).map((el) => {
  const [key, ...ids] = el.getAttribute('data-emotion')!.split(' ')
  return { key, ids, css: el.innerHTML }
})

const clientCache = createEmotionCache()

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <EmotionStylesContext.Provider value={emotionStyles}>
        <CacheProvider value={clientCache}>
          <RemixBrowser />
        </CacheProvider>
      </EmotionStylesContext.Provider>
    </StrictMode>
  )
})
