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
    // Bundle MUI, Emotion, and @babel/runtime only during production build.
    // In dev, Vite SSR evaluates modules in an ESM context where CJS `require()`
    // calls inside bundled packages cause "require is not defined" crashes.
    // In dev, Node loads these packages directly via their CJS exports — this works fine.
    // In prod (Koyeb), bundling is required to resolve ESM directory imports.
    noExternal: command === 'build' ? [/@mui\//, /@emotion\//, /@babel\/runtime/] : [],
  },
}))
