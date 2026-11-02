import { test, expect, type Page } from './fixtures'
import AxeBuilder from '@axe-core/playwright'

const VIDEOS = /\/video\/tutos\/[^/]+\.mp4/

// Le filtre et le lecteur n'existent qu'une fois la page hydratée : on attend
// la fin des chargements avant d'interagir, comme les autres suites.
async function ouvrirPage(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

test('la page liste les six tutoriels dans le HTML prérendu', async ({ request }) => {
  const html = await (await request.get('/tutoriels')).text()
  expect(html).toContain('Chercher un trajet')
  expect(html).toContain('1 min 29')
  expect(html).toContain('Rechercher › Tous les trajets')
  expect(html).not.toContain('<video')
})

test('6 cartes, le filtre Voyageur n’en laisse qu’une, Tous les remet', async ({ page }) => {
  await ouvrirPage(page, '/tutoriels')
  await expect(page.getByTestId('tutorial-card')).toHaveCount(6)
  await page.getByRole('button', { name: 'Voyageur', exact: true }).click()
  await expect(page.getByTestId('tutorial-card')).toHaveCount(1)
  await expect(page.getByTestId('tutorial-card')).toContainText('Billets d’avion'.replace('’', "'"))
  await page.getByRole('button', { name: 'Tous', exact: true }).click()
  await expect(page.getByTestId('tutorial-card')).toHaveCount(6)
})

test('aucune requête vidéo avant le clic ; le clic ouvre le lecteur ; Échap le ferme et rend le focus', async ({ page }) => {
  const videoRequests: string[] = []
  page.on('request', (request) => {
    if (VIDEOS.test(request.url())) videoRequests.push(request.url())
  })
  await page.goto('/tutoriels')
  await page.waitForLoadState('networkidle')
  expect(videoRequests).toEqual([])
  await expect(page.locator('video')).toHaveCount(0)

  const card = page.locator('[data-tutorial="search"]')
  await card.click()
  const dialog = page.getByRole('dialog', { name: 'Chercher un trajet' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('video')).toHaveAttribute('preload', 'none')
  await expect.poll(() => videoRequests.length).toBeGreaterThan(0)
  expect(videoRequests[0]).toContain('/video/tutos/search.mp4')

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.locator('video')).toHaveCount(0)
  await expect(card).toBeFocused()
})

test('le bouton Fermer ferme le lecteur et rend le focus à la carte', async ({ page }) => {
  await ouvrirPage(page, '/tutoriels')
  const card = page.locator('[data-tutorial="flights"]')
  await card.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Fermer' }).click()
  await expect(dialog).toBeHidden()
  await expect(card).toBeFocused()
})

test('« Vidéo suivante » passe au tutoriel suivant', async ({ page }) => {
  await ouvrirPage(page, '/tutoriels')
  await page.locator('[data-tutorial="search"]').click()
  await page.getByRole('button', { name: 'Vidéo suivante' }).click()
  await expect(page.getByRole('dialog', { name: 'Suivre un colis' })).toBeVisible()
})

test('les boutons tiennent sur une ligne à 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await ouvrirPage(page, '/tutoriels')
  for (const b of await page.getByRole('group').getByRole('button').all()) {
    const box = await b.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeLessThan(60)
  }
  await page.locator('[data-tutorial="search"]').click()
  const dialog = page.getByRole('dialog')
  for (const b of await dialog.getByRole('button').all()) {
    const box = await b.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeLessThan(60)
  }
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  expect(scroll).toBe(true)
})

test('version anglaise sur /en/tutorials', async ({ page }) => {
  const videoRequests: string[] = []
  page.on('request', (request) => {
    if (VIDEOS.test(request.url())) videoRequests.push(request.url())
  })
  await ouvrirPage(page, '/en/tutorials')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Video tutorials')
  await expect(page.getByTestId('tutorial-card')).toHaveCount(6)
  await expect(page.getByTestId('tutorial-card').first()).toContainText('1 min 35 s')
  await expect(page.getByTestId('tutorial-card').first()).toContainText('Search › All routes')
  await page.getByRole('button', { name: 'Traveler', exact: true }).click()
  await expect(page.getByTestId('tutorial-card')).toHaveCount(1)
  await page.getByTestId('tutorial-card').click()
  const dialog = page.getByRole('dialog', { name: 'Flight tickets' })
  await expect(dialog).toBeVisible()
  await expect.poll(() => videoRequests.length).toBeGreaterThan(0)
  expect(videoRequests[0]).toContain('/video/tutos/flights-en.mp4')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('métadonnées : titre, canonical et alternates des deux langues', async ({ page }) => {
  await ouvrirPage(page, '/tutoriels')
  await expect(page).toHaveTitle(/Tutoriels vidéo \| Yadony/)
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en\/tutorials$/)
})

for (const path of ['/tutoriels', '/en/tutorials']) {
  test(`${path} ne présente aucune violation axe grave, page et lecteur ouvert`, async ({ page }) => {
    await ouvrirPage(page, path)
    await page.waitForLoadState('networkidle')
    const settled = () => document.getAnimations()
      .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
      .every(animation => animation.playState !== 'running')
    await page.waitForFunction(settled)
    await page.waitForTimeout(700)
    await page.waitForFunction(settled)
    const scan = async () => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      return results.violations
        .filter(v => v.impact === 'critical' || v.impact === 'serious')
        .map(v => `${v.id} sur ${v.nodes.length} noeud(s)`)
    }
    expect(await scan()).toEqual([])
    await page.locator('[data-tutorial="search"]').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.waitForTimeout(400)
    expect(await scan()).toEqual([])
  })
}
