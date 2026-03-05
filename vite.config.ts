import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    remix({
      serverModuleFormat: 'cjs',
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    // Bundle MUI packages into the server bundle so Vite handles ESM→CJS
    // transformation at build time. Without this, Node.js loads them as ESM
    // at runtime and fails on directory imports like @mui/utils/formatMuiErrorMessage.
    noExternal: [
      '@mui/material',
      '@mui/utils',
      '@mui/icons-material',
      '@mui/system',
      '@mui/styled-engine',
      '@emotion/react',
      '@emotion/styled',
      '@emotion/server',
      '@emotion/cache',
    ],
  },
})
