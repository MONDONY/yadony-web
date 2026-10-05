import { test, expect } from './fixtures'
import { storesLive } from '../../app/lib/site'

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

test('les boutons de stores se comportent selon la disponibilité de l’app', async ({ page }) => {
  await page.goto('/')
  if (storesLive) {
    // App publiée : de vrais liens vers les fiches officielles.
    const appStore = page.getByRole('link', { name: /App Store/i }).first()
    const playStore = page.getByRole('link', { name: /Google Play/i }).first()
    await expect(appStore).toHaveAttribute('href', /apps\.apple\.com/)
    await expect(playStore).toHaveAttribute('href', /play\.google\.com/)
  } else {
    // App pas encore publiée : aucun lien mort, le clic ouvre la fenêtre
    // « bientôt disponible », refermable au clavier (Échap).
    await expect(page.getByRole('link', { name: /App Store/i })).toHaveCount(0)
    // Un clic reçu avant l'hydratation de Vue est perdu (le HTML statique
    // n'a pas encore d'écouteur) : le test échouait par intermittence sur une
    // machine chargée. On reclique jusqu'à ce que la fenêtre s'ouvre.
    const dialog = page.locator('dialog[open]').first()
    await expect(async () => {
      await page.getByRole('button', { name: /App Store/i }).first().click()
      await expect(dialog).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 10000 })
    await expect(dialog).toContainText(/App Store et Google Play/i)
    await page.keyboard.press('Escape')
    await expect(page.locator('dialog[open]')).toHaveCount(0)
  }
})

test('le header mène au classement du concours', async ({ page, isMobile }) => {
  await page.goto('/')
  const lien = page.getByRole('link', { name: 'Concours bêta-testeurs' }).locator('visible=true').first()
  if (isMobile) {
    // Un clic reçu avant l'hydratation de Vue est perdu : on reclique sur
    // « Menu » jusqu'à ce que le lien du menu mobile apparaisse.
    await expect(async () => {
      await page.getByRole('button', { name: 'Menu' }).click()
      await expect(lien).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 10000 })
  }
  await lien.click()
  await expect(page).toHaveURL(/\/classement\/?$/)
})

// Six liens tiennent sur une ligne à partir de 1280 px ; en dessous, le menu
// passe dans le bouton « Menu ». Aucune largeur ne doit faire défiler la page.
for (const width of [768, 1024, 1280]) {
  test(`le header tient sans défilement horizontal en ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    const header = page.locator('header').first()
    const nav = header.getByRole('navigation', { name: 'Navigation principale' })
    if (width >= 1280) {
      await expect(nav.getByRole('link', { name: 'Concours bêta-testeurs' })).toBeVisible()
    } else {
      await expect(nav).toBeHidden()
      // Clic perdu s'il arrive avant l'hydratation : on reclique au besoin.
      const lienMobile = header.getByRole('link', { name: 'Concours bêta-testeurs' }).locator('visible=true')
      await expect(async () => {
        await header.getByRole('button', { name: 'Menu' }).click()
        await expect(lienMobile).toBeVisible({ timeout: 1000 })
      }).toPass({ timeout: 10000 })
    }
  })
}
