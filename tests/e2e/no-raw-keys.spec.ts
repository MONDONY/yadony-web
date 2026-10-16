import { test, expect } from './fixtures'

// Une clé de traduction absente s'affiche telle quelle (« journeys.traveler.title »)
// sans faire échouer le build. On parcourt les pages des deux langues et on
// refuse tout texte visible qui ressemble à une clé des fichiers de locale.
const PAGES = [
  '/', '/envoyer-colis', '/envoyer-colis/paris-dakar', '/devenir-voyageur', '/billets-avion',
  '/gp/paris-dakar', '/comment-ca-marche', '/tarifs', '/securite', '/a-propos', '/contact',
  '/en', '/en/send-a-parcel', '/en/send-a-parcel/paris-dakar', '/en/become-a-traveler',
  '/en/flight-deals', '/en/how-it-works', '/en/pricing', '/en/trust-and-safety', '/en/about', '/en/contact',
]

const RAW_KEY = /\b(?:landing|journeys|corridorPages|gp|nav|footer|home|pricing|trust|about|contact|howItWorks|error|language|beta|a11y)\.[A-Za-z][\w.[\]]*/

for (const path of PAGES) {
  test(`la page ${path} n'affiche aucune clé de traduction brute`, async ({ page }) => {
    await page.goto(path)
    const text = await page.locator('body').innerText()
    expect(text.match(RAW_KEY)?.[0] ?? null).toBeNull()
    const alts = await page.locator('img[alt]').evaluateAll(images => images.map(img => img.getAttribute('alt') ?? ''))
    expect(alts.filter(alt => RAW_KEY.test(alt))).toEqual([])
  })
}
