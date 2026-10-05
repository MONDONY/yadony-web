import { test, expect } from './fixtures'

test('la page du classement affiche le titre, le statut et le barème', async ({ page }) => {
  await page.goto('/classement')
  await expect(page.getByRole('heading', { level: 1, name: /classement des testeurs/i })).toBeVisible()
  await expect(page.getByTestId('contest-status')).toBeVisible()
  await expect(page.getByTestId('contest-rules')).toBeVisible()
  await expect(page.getByTestId('rules-group')).toHaveCount(5)
})

test('la page du classement n’est pas indexée', async ({ page }) => {
  await page.goto('/classement')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
})

test('le bouton du bandeau mène au barème', async ({ page }) => {
  await page.goto('/classement')
  await page.getByRole('link', { name: /voir le barème/i }).click()
  await expect(page).toHaveURL(/#bareme$/)
  await expect(page.getByRole('heading', { name: /comment gagner des points/i })).toBeInViewport()
})

test('le lien du guide s’ouvre dans un nouvel onglet', async ({ page }) => {
  await page.goto('/classement')
  const lien = page.getByRole('link', { name: /guide complet du concours/i })
  await expect(lien).toHaveAttribute('target', '_blank')
  await expect(lien).toHaveAttribute('href', /docs\.google\.com\/document\//)
})

test('la version anglaise existe', async ({ page }) => {
  await page.goto('/en/leaderboard')
  await expect(page.getByRole('heading', { level: 1, name: /tester leaderboard/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /how to earn points/i })).toBeVisible()
})

test('le classement est absent du sitemap', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toContain('/classement')
  expect(sitemap).not.toContain('/leaderboard')
})

test('le classement de la phase 1 est affiché avec l’ancienne formule', async ({ page }) => {
  await page.goto('/classement')
  const phase1 = page.getByTestId('contest-phase1')
  await expect(phase1).toBeVisible()
  await expect(phase1.getByTestId('phase1-row').first()).toContainText('Koro D.')
  await expect(phase1).toContainText('minutes × 2')
})
