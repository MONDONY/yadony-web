import { test, expect } from './fixtures'
import { appStoreUrl, playStoreUrl } from '../../app/lib/site'

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

// Les deux fiches sont publiées : chaque badge est un vrai lien, ouvert dans un
// nouvel onglet, avec le badge officiel dans la langue de la page.
for (const [path, lang] of [['/', 'fr'], ['/en', 'en']] as const) {
  test(`les badges des stores de ${path} mènent aux fiches, avec les badges officiels`, async ({ page }) => {
    await page.goto(path)
    const apple = page.locator(`a[href="${appStoreUrl}"]`).first()
    const google = page.locator(`a[href="${playStoreUrl}"]`).first()
    for (const link of [apple, google]) {
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    await expect(apple.locator('img')).toHaveAttribute('src', `/img/stores/app-store-${lang}.svg`)
    await expect(google.locator('img')).toHaveAttribute('src', `/img/stores/google-play-${lang}.png`)
    for (const img of [apple.locator('img'), google.locator('img')]) {
      await img.scrollIntoViewIfNeeded()
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
      expect((await img.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    }
  })
}

// Sur téléphone, le bouton de téléchargement est visible dès le premier écran
// de chaque page principale, sans ouvrir le menu ni faire défiler.
for (const [label, path] of [
  ['accueil', '/'],
  ['envoyer un colis', '/envoyer-colis'],
  ['devenir voyageur', '/devenir-voyageur'],
  ['comment ça marche', '/comment-ca-marche'],
  ['tarifs', '/tarifs'],
  ['accueil anglais', '/en'],
] as const) {
  test(`téléphone 360 px : le bouton Télécharger est visible en haut (${label})`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 700 })
    await page.goto(path)
    const header = page.locator('header').first()
    const bouton = header.getByRole('link', { name: /^(Télécharger|Download)$/ })
    await expect(bouton).toBeVisible()
    const box = (await bouton.boundingBox())!
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(700)
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x + box.width).toBeLessThanOrEqual(360)
    // Libellé sur une seule ligne, en-tête sans défilement horizontal.
    expect(await bouton.evaluate((el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      return new Set([...range.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top / 4))).size
    })).toBe(1)
    // L'en-tête lui-même ne déborde pas (la page /tarifs a un bloc animé qui
    // dépasse un instant : hors sujet ici).
    expect(await header.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0)
  })
}

test('téléphone : le sélecteur de langue passe dans le menu', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 700 })
  await page.goto('/')
  const header = page.locator('header').first()
  await expect(header.locator('a[hreflang="en"]').locator('visible=true')).toHaveCount(0)
  await expect(async () => {
    await header.getByRole('button', { name: 'Menu' }).click()
    await expect(header.locator('#menu-mobile a[hreflang="en"]')).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 10000 })
  await expect(header.locator('#menu-mobile a[hreflang="en"]')).toHaveAttribute('href', /\/en\/?$/)
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

// En-tête à quatre liens : ils tiennent sur une ligne dès 1024 px (lg) ; en
// dessous, le menu passe dans le bouton « Menu ». Sécurité et Billets d'avion
// ne sont plus dans l'en-tête : ils restent dans le pied de page. Aucune
// largeur ne doit faire défiler la page.
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
    if (width >= 1024) {
      await expect(nav.getByRole('link', { name: 'Tarifs' })).toBeVisible()
      await expect(header.getByRole('button', { name: 'Menu' })).toBeHidden()
    } else {
      await expect(nav).toBeHidden()
      // Clic perdu s'il arrive avant l'hydratation : on reclique au besoin.
      const lienMobile = header.getByRole('link', { name: 'Tarifs' }).locator('visible=true')
      await expect(async () => {
        await header.getByRole('button', { name: 'Menu' }).click()
        await expect(lienMobile).toBeVisible({ timeout: 1000 })
      }).toPass({ timeout: 10000 })
    }
  })
}

// À 1024 px, le plus étroit des écrans en ligne, les libellés anglais (plus
// longs) restent sur une ligne et le header garde sa hauteur de 64 px.
for (const path of ['/', '/en']) {
  test(`à 1024 px, les quatre liens de ${path} restent sur une ligne`, async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto(path)
    const liens = page.locator('header nav').first().getByRole('link')
    await expect(liens).toHaveCount(4)
    for (const lien of await liens.all()) {
      // Le texte du lien tient sur une seule ligne (la boîte, elle, mesure
      // 44 px : voir le test des cibles tactiles plus bas).
      const lignes = await lien.evaluate((el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        return new Set([...range.getClientRects()].map(r => Math.round(r.top))).size
      })
      expect(lignes).toBe(1)
    }
    const logo = await page.locator('header img[alt="Yadony"]').boundingBox()
    const premier = await liens.first().boundingBox()
    expect((logo?.x ?? 0) + (logo?.width ?? 0)).toBeLessThan(premier?.x ?? 0)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

// Cibles tactiles : chaque lien en ligne de l'en-tête mesure au moins 44 px de
// haut, dès 1024 px (tablettes en paysage comprises), en français et en anglais.
for (const width of [1024, 1280]) {
  for (const path of ['/', '/en']) {
    test(`à ${width} px, les liens de l'en-tête de ${path} font au moins 44 px de haut`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(path)
      const liens = page.locator('header nav').first().getByRole('link')
      await expect(liens).toHaveCount(4)
      for (const lien of await liens.all()) {
        const box = await lien.boundingBox()
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
      }
      const rangee = await page.locator('header .h-16').first().boundingBox()
      expect(rangee?.height).toBe(64)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
}

test("l'en-tête à 1280 px affiche exactement 4 liens de navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const liens = page.locator('header nav[aria-label="Navigation principale"] a')
  await expect(liens).toHaveCount(4)
  await expect(liens).toHaveText(['Envoyer un colis', 'Devenir voyageur', 'Comment ça marche', 'Tarifs'])
  const nav = page.locator('header').getByRole('navigation', { name: 'Navigation principale' })
  await expect(nav.getByRole('link', { name: 'Sécurité' })).toHaveCount(0)
  await expect(nav.getByRole('link', { name: "Billets d'avion" })).toHaveCount(0)
})

test('le pied de page garde Sécurité, Billets d’avion et les liens légaux', async ({ page }) => {
  await page.goto('/')
  const footer = page.locator('footer')
  await expect(footer.getByRole('link', { name: 'Sécurité', exact: true })).toBeVisible()
  await expect(footer.getByRole('link', { name: "Billets d'avion" })).toBeVisible()
  const legal = footer.getByRole('navigation', { name: 'Informations légales' })
  // Cinq pages légales plus le bouton « Gérer les cookies » : six entrées.
  await expect(legal.getByRole('link')).toHaveCount(5)
  await expect(legal.getByRole('button', { name: 'Gérer les cookies' })).toBeVisible()
})

// Menu mobile : il se referme dès que le visiteur passe à autre chose, et ses
// liens ne sont atteignables au clavier que lorsqu'il est ouvert.
test.describe('menu mobile', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(!isMobile, 'le menu en ligne remplace le menu déroulant au-delà de 1024 px')
    await page.goto('/')
  })

  async function ouvrir(page: import('@playwright/test').Page) {
    const bouton = page.getByRole('button', { name: 'Menu' })
    // Clic perdu s'il arrive avant l'hydratation : on reclique au besoin.
    await expect(async () => {
      await bouton.click()
      await expect(bouton).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
    }).toPass({ timeout: 10000 })
    return bouton
  }

  test('fermé, il est inerte et masqué', async ({ page }) => {
    const panneau = page.getByTestId('menu-mobile-panel')
    await expect(panneau).toHaveAttribute('inert', /.*/)
    await expect(panneau.getByRole('link', { name: 'Tarifs' })).toBeHidden()
  })

  test('Échap le referme et rend le focus au bouton', async ({ page }) => {
    const bouton = await ouvrir(page)
    const panneau = page.getByTestId('menu-mobile-panel')
    await expect(panneau.getByRole('link', { name: 'Tarifs' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(bouton).toHaveAttribute('aria-expanded', 'false')
    await expect(panneau.getByRole('link', { name: 'Tarifs' })).toBeHidden()
    await expect(bouton).toBeFocused()
  })

  test('un appui hors du header le referme', async ({ page }) => {
    const bouton = await ouvrir(page)
    await page.mouse.click(10, 600)
    await expect(bouton).toHaveAttribute('aria-expanded', 'false')
  })

  test('le retour arrière du navigateur le referme', async ({ page }) => {
    const bouton = await ouvrir(page)
    await page.getByTestId('menu-mobile-panel').getByRole('link', { name: 'Tarifs' }).click()
    await expect(page).toHaveURL('/tarifs')
    await expect(bouton).toHaveAttribute('aria-expanded', 'false')
    await ouvrir(page)
    await page.goBack()
    await expect(page).toHaveURL('/')
    await expect(bouton).toHaveAttribute('aria-expanded', 'false')
  })

  test('en paysage, la liste défile au lieu de déborder de l’écran', async ({ page }) => {
    await page.setViewportSize({ width: 740, height: 360 })
    await ouvrir(page)
    const nav = page.getByRole('navigation', { name: 'Navigation mobile' })
    const bas = await nav.evaluate(el => el.getBoundingClientRect().bottom)
    expect(bas).toBeLessThanOrEqual(360)
    await expect(nav).toHaveCSS('overflow-y', 'auto')
  })
})
