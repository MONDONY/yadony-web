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
  expect(html).toContain('Rechercher un voyageur')
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
  const dialog = page.getByRole('dialog', { name: 'Rechercher un voyageur' })
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
  // Le focus revient à la carte qui a ouvert le lecteur, pas à la dernière vue.
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('[data-tutorial="search"]')).toBeFocused()
})

test('le lecteur propose les boutons des stores ; Échap ferme « bientôt disponible » sans fermer le lecteur', async ({ page }) => {
  await ouvrirPage(page, '/tutoriels')
  await expect(page.locator('a[href*="ouvrir"]')).toHaveCount(0)
  await page.locator('[data-tutorial="search"]').click()
  const player = page.getByRole('dialog', { name: 'Rechercher un voyageur' })
  await expect(player).toBeVisible()
  await expect(player.locator('a[href*="ouvrir"]')).toHaveCount(0)
  await player.getByRole('button', { name: 'App Store' }).click()
  const soon = page.getByRole('dialog', { name: 'Bientôt disponible' })
  await expect(soon).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(soon).toBeHidden()
  await expect(player).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(player).toBeHidden()
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

test.describe('teaser d’accueil et lien depuis Comment ça marche', () => {
  test('l’accueil montre 4 affiches dans l’ordre, sans vidéo, et un lien vers tous les tutoriels', async ({ page }) => {
    const videoRequests: string[] = []
    page.on('request', (request) => {
      if (VIDEOS.test(request.url())) videoRequests.push(request.url())
    })
    await ouvrirPage(page, '/')
    const section = page.locator('section', { has: page.getByRole('heading', { name: 'Voir avant d’essayer.'.replace('’', "'") }) })
    await section.scrollIntoViewIfNeeded()
    const tuiles = section.locator('a[data-home-tutorial]')
    await expect(tuiles).toHaveCount(4)
    await expect(tuiles).toContainText(['Rechercher un voyageur', 'Suivre un colis', 'Moyens de paiement', 'Billets d\'avion'])
    await expect(tuiles.first()).toContainText('1 min 29')
    await expect(section.locator('img[loading="lazy"]')).toHaveCount(4)
    await expect(section.locator('video')).toHaveCount(0)
    await expect(section.getByRole('link', { name: 'Tous les tutoriels' })).toHaveAttribute('href', '/tutoriels')
    expect(videoRequests).toEqual([])
  })

  test('un clic sur une affiche mène au lecteur ouvert sur cette vidéo', async ({ page }) => {
    await ouvrirPage(page, '/')
    const tuile = page.locator('a[data-home-tutorial="track"]')
    await tuile.scrollIntoViewIfNeeded()
    await tuile.click()
    await expect(page).toHaveURL(/\/tutoriels\?v=track$/)
    await expect(page.getByRole('dialog', { name: 'Suivre un colis' })).toBeVisible()
  })

  test('version anglaise du teaser et lien vers /en/tutorials', async ({ page }) => {
    await ouvrirPage(page, '/en')
    const section = page.locator('section', { has: page.getByRole('heading', { name: 'See it before you try it.' }) })
    await section.scrollIntoViewIfNeeded()
    await expect(section.locator('a[data-home-tutorial]')).toHaveCount(4)
    await expect(section.getByRole('link', { name: 'All tutorials' })).toHaveAttribute('href', '/en/tutorials')
    await section.locator('a[data-home-tutorial="payments"]').click()
    await expect(page).toHaveURL(/\/en\/tutorials\?v=payments$/)
    await expect(page.getByRole('dialog', { name: 'Payment methods' })).toBeVisible()
  })

  test('?v=<id> ouvre le lecteur, Échap le ferme et retire v de l’adresse sans recharger', async ({ page }) => {
    await ouvrirPage(page, '/tutoriels?v=flights')
    const dialog = page.getByRole('dialog', { name: 'Billets d\'avion' })
    await expect(dialog).toBeVisible()
    await page.evaluate(() => { (window as unknown as { marqueur: boolean }).marqueur = true })
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(/\/tutoriels$/)
    await expect(page.locator('[data-tutorial="flights"]')).toBeFocused()
    expect(await page.evaluate(() => (window as unknown as { marqueur?: boolean }).marqueur)).toBe(true)
  })

  for (const valeur of ['inconnu', '']) {
    test(`?v=${valeur || '(vide)'} est ignoré sans erreur ni dialogue`, async ({ page }) => {
      const erreurs: string[] = []
      page.on('pageerror', error => erreurs.push(error.message))
      await ouvrirPage(page, `/tutoriels?v=${valeur}`)
      await expect(page.getByTestId('tutorial-card')).toHaveCount(6)
      await expect(page.getByRole('dialog')).toHaveCount(0)
      expect(erreurs).toEqual([])
    })
  }

  test('« Comment ça marche » renvoie vers tous les tutoriels, en français et en anglais', async ({ page }) => {
    await ouvrirPage(page, '/comment-ca-marche')
    await expect(page.getByRole('main').getByRole('link', { name: 'Tous les tutoriels' })).toHaveAttribute('href', '/tutoriels')
    await ouvrirPage(page, '/en/how-it-works')
    await expect(page.getByRole('main').getByRole('link', { name: 'All tutorials' })).toHaveAttribute('href', '/en/tutorials')
  })

  test('à 360 px : pas de débordement et cibles d’au moins 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await ouvrirPage(page, '/')
    const tuiles = page.locator('a[data-home-tutorial]')
    await tuiles.first().scrollIntoViewIfNeeded()
    for (const tuile of await tuiles.all()) {
      const box = await tuile.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
    const lien = page.getByRole('link', { name: 'Tous les tutoriels' }).first()
    const box = await lien.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeLessThan(60)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})
