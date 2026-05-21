import { defineConfig } from 'cypress'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transformWithEsbuild } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Transform .js files that contain JSX before vite:import-analysis runs
const jsxInJs = {
  name: 'jsx-in-js',
  enforce: 'pre',
  transform(code, id) {
    if (id.endsWith('.js') && /\/(src|cypress)\//.test(id)) {
      return transformWithEsbuild(code, id, { loader: 'jsx' })
    }
  },
}

export default defineConfig({
  e2e: {
    baseUrl: 'https://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    allowCypressEnv: true,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        plugins: [jsxInJs, react()],
        optimizeDeps: {
          force: true,
          esbuildOptions: { loader: { '.js': 'jsx' } },
        },
        resolve: {
          alias: [
            { find: 'src/', replacement: `${path.resolve(__dirname, 'src')}/` },
            {
              find: '@appComponents',
              replacement: path.resolve(__dirname, 'src/components/shared'),
            },
          ],
          extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
        },
      },
    },
    indexHtmlFile: 'cypress/support/component-index.html',
    specPattern: 'cypress/component/**/*.cy.{js,jsx}',
    supportFile: 'cypress/support/component.jsx',
    video: false,
    screenshotOnRunFailure: true,
  },
})
