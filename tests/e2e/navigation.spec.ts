import { test, expect } from './fixtures'
import { appStoreLive, playStoreLive, playStoreUrl } from '../../app/lib/site'

const PAGES = [
  '/', '/comment-ca-marche', '/tarifs', '/securite',
  '/a-propos', '/contact', '/mentions-legales', '/cgu', '/confidentialite',
  '/suppression-compte', '/en/delete-account',
  '/envoyer-colis', '/envoyer-colis/paris-dakar', '/envoyer-colis/marseille-douala',
  '/devenir-voyageur', '/billets-avion', '/gp/paris-dakar',
  '/en', '/en/send-a-parcel', '/en/send-a-parcel/lyon-bamako', '/en/become-a-traveler', '/en/flight-deals',
]

for (const path of PAGES) {
  test(`la page ${path} se charge sans erreur console`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
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

test('chaque bouton de store suit la disponibilité de sa fiche', async ({ page }) => {
  await page.goto('/')
  if (playStoreLive) {
    // Fiche Google Play publiée : un vrai lien, ouvert dans un nouvel onglet.
    const playStore = page.getByRole('link', { name: /Google Play/i }).first()
    await expect(playStore).toHaveAttribute('href', playStoreUrl)
    await expect(playStore).toHaveAttribute('target', '_blank')
  } else {
    // Fiche Google Play masquée : aucun lien vers elle.
    await expect(page.getByRole('link', { name: /Google Play/i })).toHaveCount(0)
  }
  if (appStoreLive) {
    const appStore = page.getByRole('link', { name: /App Store/i }).first()
    await expect(appStore).toHaveAttribute('href', /apps\.apple\.com/)
  } else {
    // Fiche App Store pas encore publiée : aucun lien mort, le clic ouvre la
    // fenêtre « bientôt disponible », refermable au clavier (Échap).
    await expect(page.getByRole('link', { name: /App Store/i })).toHaveCount(0)
    // Un clic reçu avant l'hydratation de Vue est perdu (le HTML statique
    // n'a pas encore d'écouteur) : le test échouait par intermittence sur une
    // machine chargée. On reclique jusqu'à ce que la fenêtre s'ouvre.
    const dialog = page.locator('dialog[open]').first()
    await expect(async () => {
      await page.getByRole('button', { name: /App Store/i }).first().click()
      await expect(dialog).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 10000 })
    if (playStoreLive) {
      // Seul l'App Store est en attente : la fenêtre renvoie vers Google Play.
      await expect(dialog).toContainText(/Bientôt sur l'App Store/i)
      await expect(dialog.getByRole('link', { name: /Google Play/i })).toHaveAttribute('href', playStoreUrl)
    } else {
      // Sortie commune : la fenêtre annonce les deux stores, sans lien.
      await expect(dialog).toContainText(/Bientôt disponible/i)
      await expect(dialog).toContainText(/App Store et Google Play/i)
      await expect(dialog.getByRole('link')).toHaveCount(0)
    }
    await page.keyboard.press('Escape')
    await expect(page.locator('dialog[open]')).toHaveCount(0)
  }
})

// Le concours a quitté la barre de navigation (place laissée aux trois
// parcours) : il reste joignable depuis le pied de page de chaque page.
test('le pied de page mène au classement du concours', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('link', { name: 'Concours bêta-testeurs' }).click()
  await expect(page).toHaveURL(/\/classement\/?$/)
})

test('le pied de page relie chaque trajet et chaque page GP', async ({ page }) => {
  await page.goto('/')
  const footer = page.locator('footer')
  await expect(footer.locator('a[href^="/envoyer-colis/"]')).toHaveCount(12)
  await expect(footer.locator('a[href^="/gp/"]')).toHaveCount(4)
  await page.goto('/en')
  await expect(page.locator('footer a[href^="/gp/"]')).toHaveCount(0)
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
      await expect(nav.getByRole('link', { name: "Billets d'avion" })).toBeVisible()
    } else {
      await expect(nav).toBeHidden()
      // Clic perdu s'il arrive avant l'hydratation : on reclique au besoin.
      const lienMobile = header.getByRole('link', { name: "Billets d'avion" }).locator('visible=true')
      await expect(async () => {
        await header.getByRole('button', { name: 'Menu' }).click()
        await expect(lienMobile).toBeVisible({ timeout: 1000 })
      }).toPass({ timeout: 10000 })
    }
  })
}
