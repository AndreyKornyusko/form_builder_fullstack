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
    // Bundle all @mui/* and @emotion/* packages so Vite handles ESM→CJS
    // transformation at build time. Without this, Node 22 loads them as ESM
    // at runtime (via require(ESM)), which fails on directory imports like
    // @mui/utils/formatMuiErrorMessage. Using regex ensures all transitive
    // deps (e.g. @emotion/weak-memoize) are bundled too, preserving interop.
    noExternal: [/@mui\//, /@emotion\//, /^@babel\/runtime/],
  },
})
