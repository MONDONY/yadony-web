import { test, expect } from './fixtures'
import AxeBuilder from '@axe-core/playwright'

const PAGES = [
  '/', '/comment-ca-marche', '/tarifs', '/securite', '/a-propos', '/contact', '/parrainage?code=ABOU1890',
  '/envoyer-colis', '/envoyer-colis/paris-dakar', '/devenir-voyageur', '/billets-avion', '/gp/paris-dakar', '/en',
]

for (const path of PAGES) {
  test(`la page ${path} ne présente aucune violation critique`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    // Les blocs apparaissent en fondu au défilement : un contraste mesuré en
    // pleine transition (opacité < 1) serait un faux positif. On attend la fin
    // des animations finies ; les boucles (Dony qui flotte, défilé des moyens
    // de paiement) ne changent pas l'opacité et sont ignorées.
    // Le fondu ne démarre qu'à l'hydratation, une image après le chargement :
    // on vérifie donc l'absence d'animation en cours sur deux relevés espacés.
    const settled = () => document.getAnimations()
      .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
      .every(animation => animation.playState !== 'running')
    await page.waitForFunction(settled)
    await page.waitForTimeout(700)
    await page.waitForFunction(settled)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(serious.map((v) => `${v.id} sur ${v.nodes.length} noeud(s)`)).toEqual([])
  })
}

test('le lien d’évitement est accessible au clavier', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /contenu/i })).toBeFocused()
})
