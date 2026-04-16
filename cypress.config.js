import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3005',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true,
    allowCypressEnv: true,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    indexHtmlFile: 'cypress/support/component-index.html',
    specPattern: 'cypress/component/**/*.cy.{js,jsx}',
    supportFile: 'cypress/support/component.jsx',
    video: false,
    screenshotOnRunFailure: true,
  },
})
