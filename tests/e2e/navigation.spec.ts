import { test, expect } from '@playwright/test'

const PAGES = [
  '/', '/comment-ca-marche', '/tarifs', '/securite',
  '/a-propos', '/contact', '/mentions-legales', '/cgu', '/confidentialite',
]

for (const path of PAGES) {
  test(`la page ${path} se charge sans erreur console`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      // Les captures d'écran de l'application sous /screenshots/ ne sont pas
      // encore fournies par le client (cf. brief de la tâche 14) : leur 404
      // est attendue et ne doit pas masquer une vraie erreur console.
      if (msg.location().url.includes('/screenshots/')) return
      errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))

    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    expect(errors).toEqual([])
  })
}

test('la navigation du header mène aux bonnes pages', async ({ page, isMobile }) => {
  await page.goto('/')
  if (isMobile) {
    await page.getByRole('button', { name: 'Menu' }).click()
  }
  await page.getByRole('link', { name: 'Tarifs' }).first().click()
  await expect(page).toHaveURL('/tarifs')
})

test('les liens de stores pointent vers les magasins officiels', async ({ page }) => {
  await page.goto('/')
  const appStore = page.getByRole('link', { name: /App Store/i }).first()
  const playStore = page.getByRole('link', { name: /Google Play/i }).first()
  await expect(appStore).toHaveAttribute('href', /apps\.apple\.com/)
  await expect(playStore).toHaveAttribute('href', /play\.google\.com/)
})
