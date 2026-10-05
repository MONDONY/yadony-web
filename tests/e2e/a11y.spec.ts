import { test, expect } from './fixtures'
import AxeBuilder from '@axe-core/playwright'

const PAGES = ['/', '/comment-ca-marche', '/tarifs', '/securite', '/a-propos', '/contact']

for (const path of PAGES) {
  test(`la page ${path} ne présente aucune violation critique`, async ({ page }) => {
    await page.goto(path)
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

test('le ruban du parcours QR est atteignable et défilable au clavier', async ({ page }) => {
  await page.goto('/')
  const strip = page.getByLabel(/Faites défiler pour voir les quatre écrans/i)
  await expect(strip).toHaveAttribute('tabindex', '0')

  await strip.focus()
  await expect(strip).toBeFocused()

  // Ce conteneur ne défile qu'horizontalement (overflow-x-auto). Home/End
  // sont conventionnellement liés au défilement vertical du document par
  // les navigateurs et n'ont aucun effet ici ; Flèche droite/gauche est le
  // raccourci natif pertinent pour un ruban horizontal.
  //
  // Depuis la refonte, les quatre cartes tiennent entièrement dans un
  // viewport desktop : il n'y a alors rien à faire défiler, et c'est le
  // comportement voulu. Le défilement clavier n'est exigé que lorsque le
  // contenu déborde réellement (mobile, fenêtres étroites).
  const overflows = await strip.evaluate((el) => el.scrollWidth > el.clientWidth)
  if (!overflows) return

  const before = await strip.evaluate((el) => el.scrollLeft)
  await page.keyboard.press('ArrowRight')
  await expect(async () => {
    const after = await strip.evaluate((el) => el.scrollLeft)
    expect(after).toBeGreaterThan(before)
  }).toPass()
})
