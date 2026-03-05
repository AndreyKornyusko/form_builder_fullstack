import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ command }) => ({
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
    // Bundle MUI and Emotion so Vite handles ESM→CJS interop.
    // Without this, Node 22 loads them as ESM at runtime which fails on
    // directory imports like @mui/utils/formatMuiErrorMessage.
    //
    // @babel/runtime is ONLY bundled during build (not dev) because:
    // - In prod: Rollup transforms CJS helpers (module.exports) correctly.
    // - In dev: Vite SSR runs in ESM context where `module` is undefined,
    //   so CJS @babel/runtime helpers crash. In dev they stay external and
    //   Node loads the ESM helpers (/esm/*.js) natively — this works fine.
    noExternal: [
      /@mui\//,
      /@emotion\//,
      ...(command === 'build' ? [/@babel\/runtime/] : []),
    ],
  },
}))
