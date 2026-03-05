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
  resolve: {
    alias: [
      // Redirect @babel/runtime ESM helpers to their CJS equivalents.
      // MUI ESM files import from /helpers/esm/ which are true ES modules.
      // When Vite bundles MUI as CJS for the server, those become
      // require('/esm/...') calls that return { default: fn } instead of fn.
      // The CJS helpers export the function directly via module.exports.
      {
        find: /^@babel\/runtime\/helpers\/esm\/(.+)$/,
        replacement: '@babel/runtime/helpers/$1',
      },
    ],
  },
  ssr: {
    // Bundle all @mui/* and @emotion/* packages so Vite handles ESM→CJS
    // transformation at build time. Without this, Node 22 loads them as ESM
    // at runtime (via require(ESM)), which fails on directory imports like
    // @mui/utils/formatMuiErrorMessage.
    noExternal: [/@mui\//, /@emotion\//],
  },
})
