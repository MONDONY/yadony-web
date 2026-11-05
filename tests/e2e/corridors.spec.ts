import { test, expect, type Page, type Route } from './fixtures'

// « Prochains départs » sur les pages de trajets : amélioration progressive.
// Le HTML prérendu reste celui d'avant (aucun voyageur) ; le navigateur lit
// l'API publique de recherche après l'hydratation, avec les villes du trajet.
// L'API est simulée par `page.route` (par défaut « aucun trajet », voir
// fixtures.ts) : aucun appel réel ne part du navigateur de test.
const API = '**/public/announcements**'
const CORS = { 'access-control-allow-origin': '*' }

function card(id: string, name: string) {
  return {
    id,
    departureCity: 'Paris',
    arrivalCity: 'Dakar',
    departureDate: '2026-12-20',
    availableKg: 24,
    pricePerKgDisplay: 10.7,
    currency: 'EUR',
    transportMode: 'PLANE',
    urgent: false,
    capacityUnit: 'KG_EXACT',
    traveler: { displayName: name, averageRating: 4.9, totalTrips: 21, identityVerified: true },
  }
}

const FOUR = [card('a1', 'Mariam S.'), card('a2', 'Oumar S.'), card('a3', 'Voyageur D.'), card('a4', 'Quatrième Q.')]

function ok(content: unknown[]) {
  return { content, totalElements: content.length, page: 0, size: 20, totalPages: 1 }
}

async function respondWith(page: Page, body: unknown, status = 200) {
  await page.route(API, (route: Route) =>
    route.fulfill({ status, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) }),
  )
}

// La section est rendue par le navigateur seulement : on attend l'hydratation
// avant d'interagir.
async function hydrated(page: Page) {
  await page.waitForFunction(() => (window as unknown as { useNuxtApp?: () => { isHydrating: boolean } }).useNuxtApp?.().isHydrating === false)
}

// Nombre de lignes occupées par le texte d'un élément (1 = sur une seule ligne).
async function lineCount(locator: ReturnType<Page['locator']>): Promise<number> {
  return locator.evaluate((el) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    return new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size
  })
}

async function headings(page: Page): Promise<string[]> {
  return page.locator('main h1, main h2, main h3').evaluateAll(nodes =>
    nodes.map(node => `${node.tagName.toLowerCase()} ${node.textContent?.trim()}`),
  )
}

test.describe('prochains départs sur une page de trajet', () => {
  test('appelle l’API avec les villes du trajet et affiche trois départs sous un h2', async ({ page }) => {
    await respondWith(page, ok(FOUR))
    const calls: URL[] = []
    page.on('request', (request) => {
      if (request.url().includes('/public/announcements')) calls.push(new URL(request.url()))
    })
    await page.goto('/envoyer-colis/paris-dakar')
    const section = page.getByRole('region', { name: 'Prochains départs' })
    await expect(section).toBeVisible()
    await expect(section.getByRole('article')).toHaveCount(3)
    await expect(section).not.toContainText('Quatrième Q.')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Prochains départs')

    expect(calls).toHaveLength(1)
    // Le site envoie la ville telle qu'écrite dans corridors.ts (« Paris ») :
    // le back la met en minuscules, d'où la comparaison sans casse.
    expect(calls[0]!.searchParams.get('departureCity')?.toLowerCase()).toBe('paris')
    expect(calls[0]!.searchParams.get('arrivalCity')?.toLowerCase()).toBe('dakar')
  })

  test('le lien « Voir tous les départs » mène à la recherche du trajet', async ({ page }) => {
    await respondWith(page, ok(FOUR))
    await page.goto('/envoyer-colis/paris-dakar')
    const link = page.getByRole('region', { name: 'Prochains départs' }).getByRole('link', { name: 'Voir tous les départs' })
    await expect(link).toHaveAttribute('href', '/envoyer-colis?depart=Paris&arrivee=Dakar')
    await hydrated(page)
    await link.click()
    await expect(page).toHaveURL(/\/envoyer-colis\?depart=Paris&arrivee=Dakar$/)
  })

  test('page anglaise : titre, lien et adresse de la recherche en anglais', async ({ page }) => {
    await respondWith(page, ok(FOUR))
    await page.goto('/en/send-a-parcel/lyon-abidjan')
    const section = page.getByRole('region', { name: 'Next departures' })
    await expect(section).toBeVisible()
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Next departures')
    await expect(section.getByRole('link', { name: 'See all departures' }))
      .toHaveAttribute('href', '/en/send-a-parcel?depart=Lyon&arrivee=Abidjan')
  })

  for (const path of ['/envoyer-colis/paris-dakar', '/en/send-a-parcel/paris-dakar']) {
    test(`${path} : un seul h1, aucun niveau de titre sauté, section avant le texte éditorial`, async ({ page }) => {
      await respondWith(page, ok(FOUR))
      await page.goto(path)
      await expect(page.getByRole('region', { name: /Prochains départs|Next departures/ })).toBeVisible()
      await expect(page.locator('h1')).toHaveCount(1)
      const levels = (await headings(page)).map(line => Number(line[1]))
      expect(levels[0]).toBe(1)
      levels.slice(1).forEach((level, index) => expect(level - levels[index]!, `titre ${index + 1}`).toBeLessThanOrEqual(1))
      const lines = await headings(page)
      const upcoming = lines.findIndex(line => /Prochains départs|Next departures/.test(line))
      const editorial = lines.findIndex(line => /^h2 (Comment ça marche|How it works)/.test(line))
      expect(upcoming).toBe(1)
      expect(editorial).toBeGreaterThan(upcoming)
    })
  }

  for (const [name, status, body] of [
    ['une erreur 500', 500, { message: 'boom' }],
    ['un 429', 429, { status: 429 }],
    ['une liste vide', 200, ok([])],
    ['une réponse illisible', 200, { oops: true }],
  ] as const) {
    test(`${name} laisse la page identique : ni titre ni cadre vide, aucune erreur de la page`, async ({ page }) => {
      const problems: string[] = []
      // Le navigateur journalise lui-même « Failed to load resource » pour un
      // statut HTTP d'erreur de l'API simulée : seul ce message, pour cette
      // adresse, est toléré.
      page.on('console', (message) => {
        if (message.type() !== 'error') return
        const apiStatus = /Failed to load resource/.test(message.text()) && message.location().url.includes('/public/announcements')
        if (!apiStatus) problems.push(message.text())
      })
      page.on('pageerror', error => problems.push(error.message))

      // Référence : la même page sans aucun départ.
      const baseline = await page.context().newPage()
      await baseline.goto('/envoyer-colis/paris-dakar')
      await hydrated(baseline)
      await baseline.waitForLoadState('networkidle')
      const reference = { headings: await headings(baseline), sections: await baseline.locator('main section').count() }
      await baseline.close()

      await respondWith(page, body, status)
      await page.goto('/envoyer-colis/paris-dakar')
      await hydrated(page)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText('Prochains départs')).toHaveCount(0)
      await expect(page.locator('main article')).toHaveCount(0)
      expect(await headings(page)).toEqual(reference.headings)
      expect(await page.locator('main section').count()).toBe(reference.sections)
      expect(problems).toEqual([])
    })
  }

  test('une coupure réseau laisse la page intacte', async ({ page }) => {
    const problems: string[] = []
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      const cut = /Failed to load resource/.test(message.text()) && message.location().url.includes('/public/announcements')
      if (!cut) problems.push(message.text())
    })
    page.on('pageerror', error => problems.push(error.message))
    await page.route(API, route => route.abort())
    await page.goto('/envoyer-colis/paris-dakar')
    await hydrated(page)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Prochains départs')).toHaveCount(0)
    await expect(page.locator('h1')).toBeVisible()
    expect(problems).toEqual([])
  })

  test('le HTML prérendu reste indexable et ne contient aucune donnée de voyageur', async ({ request }) => {
    for (const path of ['/envoyer-colis/paris-dakar', '/en/send-a-parcel/paris-dakar']) {
      const html = await (await request.get(path)).text()
      expect(html).not.toMatch(/Prochains départs|Next departures|Voir tous les départs|See all departures/)
      expect(html).not.toContain('Mariam')
      expect(html).not.toContain('<article')
      expect(html).not.toMatch(/noindex/i)
      expect(html.match(/application\/ld\+json/g)).toHaveLength(2)
    }
  })

  for (const [path, label] of [
    ['/envoyer-colis/paris-dakar', 'Voir tous les départs'],
    ['/en/send-a-parcel/paris-dakar', 'See all departures'],
  ] as const) {
    test(`${path} à 360 px : le libellé tient sur une ligne, cible d’au moins 44 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await respondWith(page, ok(FOUR))
      await page.goto(path)
      const link = page.getByRole('link', { name: label })
      await expect(link).toBeVisible()
      const box = (await link.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(await lineCount(link)).toBe(1)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(360)
      const fontSize = await link.evaluate(node => parseFloat(getComputedStyle(node).fontSize))
      expect(fontSize).toBeGreaterThanOrEqual(14)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
    })
  }
})
