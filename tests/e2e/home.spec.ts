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
  test.use({ reducedMotion: 'reduce' })

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
})
