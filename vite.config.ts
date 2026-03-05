import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const muiPackages = [
  '@mui/material',
  '@mui/system',
  '@mui/utils',
  '@mui/icons-material',
  '@emotion/react',
  '@emotion/styled',
  '@emotion/server',
  '@emotion/cache',
]

export default defineConfig(({ command }) => ({
  ssr: {
    // Bundle MUI/Emotion into server bundle only at build time.
    // Avoids Node.js ESM directory import errors in production.
    // Not applied in dev — Vite SSR transform has interop issues with these packages.
    noExternal: command === 'build' ? muiPackages : [],
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
}))
