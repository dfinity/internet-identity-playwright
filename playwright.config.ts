import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: true,
    port: 5173
  },
  testDir: 'e2e',
  testMatch: ['**/*.e2e.ts', '**/*.spec.ts'],
  use: {
    testIdAttribute: 'data-tid',
    trace: 'on'
  },
  projects: [
    {
      name: 'Google Chrome',
      use: {...devices['Desktop Chrome'], channel: 'chrome'}
    }
  ]
});
