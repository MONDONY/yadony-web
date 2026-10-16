import { test, expect } from './fixtures'

// Points d'attention de la revue (plan, « Review Focus ») : le parcours croisé
// doit rester lisible sans JavaScript, sur un téléphone étroit et en
// mouvement réduit, où chaque illustration montre directement son état final.

test.describe('sans JavaScript (robots, navigateurs limités)', () => {
  test.use({ javaScriptEnabled: false })

  test('les huit étapes du parcours croisé sont dans le HTML prérendu et visibles', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveCount(1)
    const steps = page.locator('.scene-step h3')
    await expect(steps).toHaveCount(8)
    for (const step of await steps.all()) await expect(step).toBeVisible()
  })

  test('le message WhatsApp et la page de suivi du destinataire sont visibles', async ({ page }) => {
    await page.goto('/')
    // Playwright tient un élément en `opacity: 0` pour visible : on lit
    // l'opacité calculée du bloc.
    for (const text of ['Maman, ton colis part samedi avec Awa', 'Arrivé à Dakar']) {
      const opacity = await page.getByText(text).first().evaluate((el) => {
        let node: Element | null = el
        let value = 1
        while (node) { value *= Number(getComputedStyle(node).opacity); node = node.parentElement }
        return value
      })
      expect(opacity, text).toBe(1)
    }
  })
})

test.describe('téléphone étroit (360 px)', () => {
  test.use({ viewport: { width: 360, height: 760 } })

  test('aucun débordement horizontal et chaque étape garde son titre visible', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    const steps = page.locator('.scene-step h3')
    await expect(steps).toHaveCount(8)
    for (const step of await steps.all()) {
      await step.scrollIntoViewIfNeeded()
      await expect(step).toBeVisible()
    }
  })
})

test.describe('mouvement réduit', () => {
  // `reducedMotion` n'est pas une option de test : on émule la préférence
  // avant chaque navigation.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('chaque illustration affiche directement son état final', async ({ page, isMobile }) => {
    await page.goto('/')
    // Sur grand écran, seul le visuel de l'étape active est montré : on amène
    // chaque étape à l'écran. Sur téléphone, chaque étape porte son visuel.
    const steps = page.locator('.scene-step')
    for (const step of await steps.all()) await step.scrollIntoViewIfNeeded()

    const scope = isMobile ? page.locator('.scene-step') : page.locator('main')
    await steps.nth(3).scrollIntoViewIfNeeded()
    await expect(scope.locator('[data-agreed][data-shown="true"]').first()).toBeVisible()
    await steps.nth(7).scrollIntoViewIfNeeded()
    await expect(scope.locator('[data-locked="false"]').first()).toBeVisible()
    const fill = scope.locator('[data-fill]').locator('visible=true').first()
    await expect(fill).toHaveAttribute('style', /width:\s*100%/)
  })

  test('les formules de prix restent lisibles, sans retournement', async ({ page }) => {
    await page.goto('/tarifs')
    const card = page.locator('[data-mode]').first()
    await card.scrollIntoViewIfNeeded()
    await expect(card.getByText('Au kilo', { exact: true }).first()).toBeVisible()
    await expect(card.getByText('8 € le kilo').first()).toBeVisible()
    // Playwright ignore `backface-visibility` : une carte retournée paraîtrait
    // « visible » alors que son recto est de dos. On vérifie qu'elle ne tourne pas.
    await expect(card.locator('.flip-inner')).toHaveCSS('transform', 'none')
  })

  test('tous les moyens de paiement sont visibles sur un téléphone étroit', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 760 })
    await page.goto('/')
    const list = page.locator('ul').filter({ hasText: 'Carte bancaire' }).filter({ hasText: 'Espèces' }).first()
    await list.scrollIntoViewIfNeeded()
    // Chaque pastille doit tenir dans la largeur de l'écran (rien de coupé
    // par le conteneur en overflow-hidden).
    const outside = await list.locator('li').evaluateAll(items =>
      items.filter(item => item.getBoundingClientRect().right > window.innerWidth).map(item => item.textContent?.trim()))
    expect(outside).toEqual([])
  })
})
