import { CacheProvider } from '@emotion/react'
import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

import createEmotionCache from '~/utils/create-emotion-cache'

const clientCache = createEmotionCache()

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <CacheProvider value={clientCache}>
        <RemixBrowser />
      </CacheProvider>
    </StrictMode>
  )
})
