import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      apiUrl: 'http://localhost:8080',
      adminUser: {
        email: 'admin@test.com',
        password: 'Password123!'
      },
      testUser: {
        email: 'user@test.com',
        password: 'Password123!'
      }
    }
  },
})
