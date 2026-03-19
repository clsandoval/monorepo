import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 120_000,
  expect: {
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
});
