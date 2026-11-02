import { test, expect, type Locator, type Page } from './fixtures'

// Un réglage reçu avant l'hydratation de Vue est perdu (le HTML statique est
// déjà affiché) : on le répète jusqu'à ce que le total réagisse.
async function regler(curseur: Locator, valeur: string, total: Locator, attendu: string | RegExp) {
  await expect(async () => {
    await curseur.fill(valeur)
    await expect(total).toHaveText(attendu, { timeout: 500 })
  }).toPass()
}

// Le total du simulateur, cherché dans sa section et non dans toute la page.
const totalDuSimulateur = (page: Page) =>
  page.locator('section').filter({ has: page.locator('#earnings-kg') }).locator('output')

test.describe('simulateur de gain du voyageur', () => {
  test('le total prérendu vaut 120 € et suit les curseurs', async ({ page }) => {
    await page.goto('/devenir-voyageur')
    const total = totalDuSimulateur(page)
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
    const total = totalDuSimulateur(page)
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
    const total = totalDuSimulateur(page)
    await expect(total).toHaveText('€120')
    await expect(page.getByLabel('Price per kilo')).toBeVisible()
    await regler(page.getByLabel('Spare kilos'), '20', total, '€160')
  })
})

test.describe('page voyageur simplifiée', () => {
  const pages = [
    { chemin: '/devenir-voyageur', temps: 'Publiez votre trajet', main: 'Vous gardez la main', paye: 'Payé comme vous voulez', liste: 'Les étapes d\'un trajet', tuto: /Tutoriel vidéo/ },
    { chemin: '/en/become-a-traveler', temps: 'Post your trip', main: 'You stay in control', paye: 'Paid the way you want', liste: 'The steps of a trip', tuto: /Video tutorial/ },
  ]

  for (const { chemin, temps, main, paye, liste, tuto } of pages) {
    test(`${chemin} : un seul h1, quatre temps, FAQ de quatre questions, Orange Money`, async ({ page }) => {
      await page.goto(chemin)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.getByRole('list', { name: liste }).locator('> li')).toHaveCount(4)
      await expect(page.getByRole('heading', { level: 3, name: temps })).toBeVisible()
      await expect(page.getByRole('heading', { name: main })).toBeVisible()
      await expect(page.getByRole('heading', { name: paye })).toBeVisible()
      await expect(page.getByText('Orange Money').first()).toBeVisible()
      await expect(page.locator('main details')).toHaveCount(4)
      await expect(page.getByRole('figure', { name: tuto })).toHaveCount(1)
    })

    test(`${chemin} : le JSON-LD de la FAQ et le fil d'Ariane sont conservés`, async ({ request }) => {
      const html = await (await request.get(chemin)).text()
      const blocs = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]!))
      const faq = blocs.find(b => b['@type'] === 'FAQPage')
      expect(faq.mainEntity).toHaveLength(4)
      expect(blocs.some(b => b['@type'] === 'BreadcrumbList')).toBe(true)
    })
  }

  for (const { chemin } of pages) {
    test(`${chemin} : aucun niveau de titre sauté`, async ({ page }) => {
      await page.goto(chemin)
      const niveaux = await page.locator('main').locator('h1, h2, h3, h4, h5, h6').evaluateAll(
        titres => titres.map(titre => Number(titre.tagName.slice(1))),
      )
      expect(niveaux.length).toBeGreaterThan(5)
      niveaux.forEach((niveau, index) => {
        expect(niveau, `titre n° ${index + 1} de niveau h${niveau}`).toBeLessThanOrEqual(index === 0 ? 1 : niveaux[index - 1]! + 1)
      })
    })
  }

  const ordres = [
    {
      chemin: '/devenir-voyageur',
      titres: ['Ce que peuvent rapporter vos kilos', 'De la publication au paiement, en quatre temps.', 'Vous gardez la main', 'Payé comme vous voulez', 'Questions fréquentes'],
    },
    {
      chemin: '/en/become-a-traveler',
      titres: ['What your kilos could earn you', 'From posting to payment, in four steps.', 'You stay in control', 'Paid the way you want', 'Frequently asked questions'],
    },
  ]

  for (const { chemin, titres } of ordres) {
    test(`${chemin} : sections dans l'ordre de la maquette`, async ({ page }) => {
      await page.goto(chemin)
      const textes = await page.locator('main h2').allTextContents()
      const positions = titres.map(titre => textes.findIndex(texte => texte.includes(titre)))
      expect(positions, `h2 trouvés : ${textes.join(' | ')}`).not.toContain(-1)
      expect(positions).toEqual([...positions].sort((a, b) => a - b))
    })
  }

  test('la page expéditeur ne change pas : un h1 et sept étapes', async ({ page }) => {
    await page.goto('/envoyer-colis')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText("Envoyer un colis en Afrique, avec quelqu'un de confiance")
    await expect(page.getByRole('list', { name: 'Les étapes d\'un envoi' }).locator('> li')).toHaveCount(7)
  })
})
