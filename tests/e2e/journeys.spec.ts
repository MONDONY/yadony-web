import { test, expect, type Locator } from './fixtures'

// Un réglage reçu avant l'hydratation de Vue est perdu (le HTML statique est
// déjà affiché) : on le répète jusqu'à ce que le total réagisse.
async function regler(curseur: Locator, valeur: string, total: Locator, attendu: string | RegExp) {
  await expect(async () => {
    await curseur.fill(valeur)
    await expect(total).toHaveText(attendu, { timeout: 500 })
  }).toPass()
}

test.describe('simulateur de gain du voyageur', () => {
  test('le total prérendu vaut 120 € et suit les curseurs', async ({ page }) => {
    await page.goto('/devenir-voyageur')
    const total = page.locator('output')
    await expect(total).toHaveText(/120\s€/)
    await regler(page.getByLabel('Kilos libres'), '20', total, /160\s€/)
    await regler(page.getByLabel('Prix au kilo'), '10', total, /200\s€/)
  })

  test('le total est dans le HTML prérendu, avant toute exécution de script', async ({ request }) => {
    const html = await (await request.get('/devenir-voyageur')).text()
    expect(html).toMatch(/<output[^>]*>120\s€<\/output>/)
  })

  test('les curseurs se règlent au clavier', async ({ page }) => {
    await page.goto('/devenir-voyageur')
    const total = page.locator('output')
    await expect(async () => {
      await page.getByLabel('Kilos libres').focus()
      await page.keyboard.press('ArrowRight')
      await expect(total).toHaveText(/128\s€/, { timeout: 500 })
    }).toPass()
  })

  test('chaque curseur offre une zone tactile d’au moins 44 px', async ({ page }) => {
    await page.goto('/devenir-voyageur')
    for (const label of ['Kilos libres', 'Prix au kilo']) {
      const box = await page.getByLabel(label).boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('la page anglaise affiche le simulateur en anglais', async ({ page }) => {
    await page.goto('/en/become-a-traveler')
    const total = page.locator('output')
    await expect(total).toHaveText('€120')
    await expect(page.getByLabel('Price per kilo')).toBeVisible()
    await regler(page.getByLabel('Spare kilos'), '20', total, '€160')
  })
})
