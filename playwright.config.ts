import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      // Public REST API: https://restful-booker.herokuapp.com/apidoc/index.html
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
    {
      // Playwright's own demo app: https://demo.playwright.dev/todomvc
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://demo.playwright.dev',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },
  ],
});
