import { defineConfig, devices } from '@playwright/test'

// Port dédié : le 3000 peut déjà être occupé par un `nuxt dev` d'une
// session précédente (500 en réponse). `reuseExistingServer` s'y
// attacherait silencieusement et produirait des échecs sans rapport avec
// le site. On utilise donc le 3100, propre à cette suite.
const PORT = 3100

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: `pnpm generate && pnpm exec serve .output/public -l ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
