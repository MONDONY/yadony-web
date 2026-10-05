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
  // Après 20 h 00, la phase 1 s'insère au-dessus du barème une fois la page
  // montée : on attend qu'elle soit là pour que le défilement vise la bonne place.
  await page.clock.setFixedTime(new Date('2026-10-05T18:31:00Z'))
  await page.goto('/classement')
  await expect(page.getByTestId('phase1-row').first()).toBeVisible()
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

test('les résultats de la phase 1 restent masqués avant 20 h 00 (Paris)', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T17:00:00Z'))
  await page.goto('/classement')
  const phase1 = page.getByTestId('contest-phase1')
  await expect(phase1).toContainText('minutes × 2')
  await expect(phase1.getByTestId('phase1-teaser')).toContainText(/dévoilés/i)
  await expect(phase1.getByTestId('phase1-row')).toHaveCount(0)
})

test('le HTML statique ne contient aucun résultat de la phase 1', async ({ request }) => {
  const html = await (await request.get('/classement')).text()
  expect(html).not.toContain('data-testid="phase1-row"')
})

test('les résultats de la phase 1 apparaissent à partir de 20 h 00 (Paris)', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T18:01:00Z'))
  await page.goto('/classement')
  const phase1 = page.getByTestId('contest-phase1')
  await expect(phase1.getByTestId('phase1-row')).toHaveCount(51)
  await expect(phase1.getByTestId('podium-step')).toHaveCount(3)
  await expect(phase1.getByTestId('podium-name').first()).not.toBeEmpty()
})
