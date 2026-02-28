import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    retries: {
      runMode: 2,   // CI: retry flaky tests up to 2 times
      openMode: 0,
    },
  },
})
