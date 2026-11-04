import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page, type Route } from './fixtures'

// Recherche publique anonyme sur /envoyer-colis. L'API est simulée par
// `page.route` : aucun appel réel ne part du navigateur de test.
const API = '**/public/announcements**'
const CORS = { 'access-control-allow-origin': '*' }

function card(id: string, name: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    departureCity: 'Paris',
    arrivalCity: 'Abidjan',
    departureDate: '2026-12-20',
    availableKg: 24,
    pricePerKgDisplay: 10.7,
    currency: 'EUR',
    transportMode: 'PLANE',
    urgent: false,
    capacityUnit: 'KG_EXACT',
    traveler: { displayName: name, averageRating: 4.9, totalTrips: 21, identityVerified: true },
    ...extra,
  }
}

const THREE = [card('a1', 'Mariam S.'), card('a2', 'Oumar S.', { urgent: true }), card('a3', 'Voyageur D.')]

function ok(content: unknown[], extra: Record<string, unknown> = {}) {
  return { content, totalElements: content.length, page: 0, size: 20, totalPages: 1, ...extra }
}

async function respondWith(page: Page, body: unknown, status = 200) {
  await page.route(API, (route: Route) =>
    route.fulfill({ status, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) }),
  )
}

// API paginée : `page` n renvoie jusqu'à `size` cartes d'identifiants uniques.
async function respondPaged(page: Page, totalElements: number, totalPages: number, size = 20) {
  await page.route(API, (route: Route) => {
    const index = Number(new URL(route.request().url()).searchParams.get('page') ?? '0')
    const count = Math.max(0, Math.min(size, totalElements - index * size))
    const content = Array.from({ length: count }, (_, n) => card(`p${index}-${n}`, `Voyageur ${index * size + n + 1}`))
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS,
      body: JSON.stringify({ content, totalElements, page: index, size, totalPages }),
    })
  })
}

function apiCalls(page: Page): URL[] {
  const calls: URL[] = []
  page.on('request', (request) => {
    if (request.url().includes('/public/announcements')) calls.push(new URL(request.url()))
  })
  return calls
}

// Le formulaire est rendu côté serveur : ce qui est saisi avant l'hydratation
// est effacé. Les tests attendent donc la fin de l'hydratation avant de saisir.
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

const SEARCH = '/envoyer-colis?depart=Paris&arrivee=Abidjan&quand=ce-mois'

test.describe('recherche anonyme', () => {
  test('l’adresse nue affiche le formulaire sans appeler l’API', async ({ page }) => {
    const calls = apiCalls(page)
    await page.goto('/envoyer-colis')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('search')).toBeVisible()
    await expect(page.locator('#recherche [data-state]')).toHaveCount(0)
    expect(calls).toHaveLength(0)
  })

  test('une recherche Paris → Abidjan affiche trois cartes et un compteur', async ({ page }) => {
    await respondWith(page, ok(THREE))
    const calls = apiCalls(page)
    await page.goto('/envoyer-colis')
    await hydrated(page)
    const form = page.getByRole('search')
    await form.getByLabel('Départ').fill('Paris')
    await form.getByLabel('Arrivée').fill('Abidjan')
    await form.getByLabel('Quand').selectOption('ce-mois')
    // Marqueur posé avant la soumission : il disparaît si la page recharge.
    await page.evaluate(() => { (window as unknown as { __kept: boolean }).__kept = true })
    await form.getByRole('button', { name: 'Voir les voyageurs' }).click()

    await expect(page.getByRole('article')).toHaveCount(3)
    await expect(page.getByRole('heading', { name: '3 voyageurs pour Paris → Abidjan' })).toBeVisible()
    await expect(page).toHaveURL(/\/envoyer-colis\?depart=Paris&arrivee=Abidjan&quand=ce-mois$/)
    expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0]!.searchParams.get('departureCity')).toBe('Paris')
    expect(calls[0]!.searchParams.get('arrivalCity')).toBe('Abidjan')
    expect(calls[0]!.searchParams.get('departureDateFrom')).not.toBeNull()
  })

  test('une adresse avec paramètres lance la recherche au chargement, sans erreur console', async ({ page }) => {
    const problems: string[] = []
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) problems.push(message.text())
    })
    page.on('pageerror', error => problems.push(error.message))
    await respondWith(page, ok(THREE))
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(3)
    await page.waitForLoadState('networkidle')
    expect(problems).toEqual([])
    await expect(page.getByRole('button', { name: 'Urgent' })).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByLabel('Départ')).toHaveValue('Paris')
    await expect(page.getByLabel('Arrivée')).toHaveValue('Abidjan')
    await expect(page.getByLabel('Quand')).toHaveValue('ce-mois')
  })

  test('le filtre Urgent ajoute urgent=true à l’appel et à l’adresse', async ({ page }) => {
    await respondWith(page, ok(THREE))
    const calls = apiCalls(page)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(3)
    await page.getByRole('button', { name: 'Urgent' }).click()
    await expect(page.getByRole('button', { name: 'Urgent' })).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => calls.at(-1)?.searchParams.get('urgent')).toBe('true')
    await expect(page).toHaveURL(/urgent=1/)
  })

  test('Précédent et Suivant du navigateur restaurent la recherche', async ({ page }) => {
    await respondWith(page, ok(THREE))
    const calls = apiCalls(page)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(3)
    await page.getByRole('button', { name: 'Urgent' }).click()
    await expect(page).toHaveURL(/urgent=1/)
    await expect.poll(() => calls.at(-1)?.searchParams.get('urgent')).toBe('true')
    await page.goBack()
    await expect(page).not.toHaveURL(/urgent/)
    await expect(page.getByRole('button', { name: 'Urgent' })).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(() => calls.at(-1)?.searchParams.get('urgent')).toBeNull()
    await page.goForward()
    await expect(page.getByRole('button', { name: 'Urgent' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('Demander ouvre la remise à l’app, sans QR code', async ({ page }) => {
    await respondWith(page, ok(THREE))
    await page.goto(SEARCH)
    await page.getByRole('button', { name: /Demander à Mariam S\./ }).click()
    const dialog = page.getByRole('dialog', { name: 'Pour réserver, passez par l\'app.' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('canvas, img[alt*="QR" i]')).toHaveCount(0)
    await dialog.getByRole('button', { name: 'Fermer' }).click()
    await expect(dialog).toBeHidden()
  })

  test('un 429 affiche le message dédié', async ({ page }) => {
    await respondWith(page, { status: 429 }, 429)
    await page.goto(SEARCH)
    await expect(page.locator('[data-state="rate-limited"]')).toContainText('trop de recherches')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('un 404 affiche le repli, le contenu éditorial reste visible et Réessayer relance', async ({ page }) => {
    await respondWith(page, { status: 404 }, 404)
    const calls = apiCalls(page)
    await page.goto(SEARCH)
    const error = page.locator('[data-state="error"]')
    await expect(error).toContainText('La recherche ne répond pas')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('a[href^="/envoyer-colis/"]').first()).toBeVisible()
    await respondWith(page, ok(THREE))
    await error.getByRole('button', { name: 'Réessayer' }).click()
    await expect(page.getByRole('article')).toHaveCount(3)
    expect(calls.length).toBeGreaterThanOrEqual(2)
  })

  test('aucun résultat : suggestions, et « Voir les 3 prochains mois » élargit sans recharger', async ({ page }) => {
    await page.route(API, (route) => {
      const wide = new URL(route.request().url()).searchParams.get('departureDateTo')
      const month = new Date().getMonth()
      const endsThisMonth = wide !== null && new Date(`${wide}T12:00:00`).getMonth() === month
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: CORS,
        body: JSON.stringify(endsThisMonth ? ok([]) : ok(THREE)),
      })
    })
    await page.goto('/envoyer-colis?depart=Paris&arrivee=Bamako&quand=ce-mois')
    const empty = page.locator('[data-state="empty"]')
    await expect(empty).toContainText('Aucun voyageur pour Paris → Bamako ce mois-ci.')
    await page.evaluate(() => { (window as unknown as { __kept: boolean }).__kept = true })
    await empty.getByRole('button', { name: 'Voir les 3 prochains mois' }).click()
    await expect(page).toHaveURL(/quand=3-mois/)
    await expect(page.getByRole('article')).toHaveCount(3)
    await expect(page.getByLabel('Quand')).toHaveValue('3-mois')
    expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true)
  })

  test('des paramètres corrompus ne cassent rien et ne sont jamais rendus bruts', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await respondWith(page, ok([]))
    const calls = apiCalls(page)
    await page.goto('/envoyer-colis?page=-3&depart=<script>window.__xss=1</script>&quand=xx&minKg=abc')
    await expect(page.locator('[data-state="empty"]')).toBeVisible()
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined()
    await expect(page.locator('main script', { hasText: '__xss' })).toHaveCount(0)
    expect(calls[0]!.searchParams.get('page')).toBe('0')
    expect(calls[0]!.searchParams.get('minAvailableKg')).toBeNull()
    expect(calls[0]!.searchParams.has('departureDateTo')).toBe(false)
    expect(errors).toEqual([])
  })

  test('le texte venu de l’API est rendu comme du texte', async ({ page }) => {
    await respondWith(page, ok([card('x1', '<img src=x onerror=window.__pwn=1>')]))
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(1)
    await expect(page.locator('article img')).toHaveCount(0)
    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn)).toBeUndefined()
  })

  test('adresse nue indexable, adresse avec paramètres en noindex', async ({ page }) => {
    await respondWith(page, ok(THREE))
    await page.goto('/envoyer-colis')
    await page.waitForLoadState('networkidle')
    const robots = page.locator('meta[name="robots"]')
    expect(await robots.count() === 0 || !/noindex/.test(await robots.first().getAttribute('content') ?? '')).toBe(true)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(3)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1)
  })

  test('le HTML prérendu de l’adresse nue reste indexable', async ({ request }) => {
    const html = await (await request.get('/envoyer-colis')).text()
    expect(html).not.toMatch(/name="robots"[^>]*noindex/)
  })

  test('le sitemap ne contient aucune adresse avec « ? »', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    expect(xml).toContain('/envoyer-colis</loc>')
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]!)
    expect(locs.filter(url => url.includes('?'))).toEqual([])
  })

  test('/en/send-a-parcel fonctionne en anglais', async ({ page }) => {
    await respondWith(page, ok(THREE))
    const calls = apiCalls(page)
    await page.goto('/en/send-a-parcel')
    await hydrated(page)
    const form = page.getByRole('search')
    await form.getByLabel('From').fill('Paris')
    await form.getByLabel('To').fill('Abidjan')
    await form.getByRole('button', { name: 'See travelers' }).click()
    await expect(page.getByRole('article')).toHaveCount(3)
    await expect(page.getByRole('heading', { name: '3 travelers for Paris → Abidjan' })).toBeVisible()
    await expect(page).toHaveURL(/\/en\/send-a-parcel\?depart=Paris&arrivee=Abidjan/)
    expect(calls).toHaveLength(1)
  })

  test('« Voir les 5 autres » ajoute la suite à la liste, sans rechargement', async ({ page }) => {
    await respondPaged(page, 25, 2)
    const calls = apiCalls(page)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(20)
    await page.evaluate(() => { (window as unknown as { __kept: boolean }).__kept = true })
    const more = page.getByRole('button', { name: 'Voir les 5 autres' })
    await expect(more).toBeVisible()
    await more.click()
    await expect(page.getByRole('article')).toHaveCount(25)
    await expect(page.getByRole('button', { name: /Voir les .* autres/ })).toHaveCount(0)
    expect(calls.map(url => url.searchParams.get('page'))).toEqual(['0', '1'])
    expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true)
    // La page n'entre jamais dans l'adresse.
    await expect(page).not.toHaveURL(/page=/)
    // Le titre garde le total, et la région vocale annonce l'ajout.
    await expect(page.getByRole('heading', { name: '25 voyageurs pour Paris → Abidjan' })).toBeVisible()
    await expect(page.locator('#recherche > p.sr-only[role="status"]')).toContainText('5 voyageurs de plus')
  })

  test('après « Voir les autres », le focus passe à la première carte ajoutée', async ({ page }) => {
    await respondPaged(page, 25, 2)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(20)
    await page.getByRole('button', { name: 'Voir les 5 autres' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('article')).toHaveCount(25)
    const focusedText = await page.evaluate(() => document.activeElement?.textContent ?? '')
    expect(focusedText).toContain('Voyageur 21')
    expect(await page.evaluate(() => document.activeElement?.closest('#recherche') !== null)).toBe(true)
  })

  test('la page 5 n’est jamais demandée : le bouton disparaît après la page 4', async ({ page }) => {
    await respondPaged(page, 200, 10)
    const calls = apiCalls(page)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(20)
    for (let loaded = 1; loaded <= 4; loaded++) {
      await page.getByRole('button', { name: 'Voir les 20 autres' }).click()
      await expect(page.getByRole('article')).toHaveCount(20 * (loaded + 1))
    }
    await expect(page.getByRole('button', { name: /Voir les .* autres/ })).toHaveCount(0)
    await page.waitForTimeout(300)
    expect(calls.map(url => url.searchParams.get('page'))).toEqual(['0', '1', '2', '3', '4'])
  })

  test('pendant « Voir les autres », le bouton est désactivé, dit « Chargement… » et garde sa largeur', async ({ page }) => {
  let release: () => void = () => {}
  const gate = new Promise<void>((resolve) => { release = resolve })
  await respondPaged(page, 25, 2)
  await page.goto(SEARCH)
  await expect(page.getByRole('article')).toHaveCount(20)
  await hydrated(page)
  await page.route(API, async (route: Route) => {
    await gate
    const content = Array.from({ length: 5 }, (_, n) => card(`late-${n}`, `Tardif ${n + 1}`))
    await route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify({ content, totalElements: 25, page: 1, size: 20, totalPages: 2 }) })
  })
  const button = page.locator('#recherche').getByRole('button', { name: 'Voir les 5 autres' })
  const before = (await button.boundingBox())!
  await button.click()
  const busy = page.locator('#recherche').getByRole('button', { name: 'Chargement…' })
  await expect(busy).toBeDisabled()
  await expect(busy).toHaveAttribute('aria-busy', 'true')
  const during = (await busy.boundingBox())!
  expect(during.width).toBeGreaterThanOrEqual(before.width - 0.5)
  expect(during.height).toBeCloseTo(before.height, 0)
  expect(await lineCount(busy.locator('span span:not(.invisible)'))).toBe(1)
  release()
  await expect(page.getByRole('article')).toHaveCount(25)
})

test('au plafond des pages, une ligne explique qu’il faut affiner la recherche', async ({ page }) => {
  await respondPaged(page, 200, 10)
  await page.goto(SEARCH)
  await expect(page.getByRole('article')).toHaveCount(20)
  const refine = page.locator('#recherche').getByText('Affinez la recherche pour voir les autres trajets.')
  await expect(refine).toHaveCount(0)
  for (let loaded = 1; loaded <= 4; loaded++) {
    await page.getByRole('button', { name: 'Voir les 20 autres' }).click()
    await expect(page.getByRole('article')).toHaveCount(20 * (loaded + 1))
  }
  await expect(refine).toBeVisible()
  // Le titre garde le vrai total.
  await expect(page.getByRole('heading', { name: '200 voyageurs pour Paris → Abidjan' })).toBeVisible()
})

test('en anglais, le plafond et le bouton occupé sont traduits', async ({ page }) => {
  await respondPaged(page, 200, 10)
  await page.goto('/en/send-a-parcel?depart=Paris&arrivee=Abidjan')
  await expect(page.getByRole('article')).toHaveCount(20)
  for (let loaded = 1; loaded <= 4; loaded++) {
    await page.getByRole('button', { name: 'See 20 more' }).click()
    await expect(page.getByRole('article')).toHaveCount(20 * (loaded + 1))
  }
  await expect(page.getByText('Refine your search to see more trips.')).toBeVisible()
})

test('un échec de « Voir les autres » garde les cartes et l’indique près du bouton', async ({ page }) => {
    await respondPaged(page, 25, 2)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(20)
    await page.route(API, route => route.fulfill({ status: 500, headers: CORS, body: '{}' }))
    await page.getByRole('button', { name: 'Voir les 5 autres' }).click()
    await expect(page.getByRole('alert')).toContainText('Impossible de charger la suite')
    await expect(page.getByRole('article')).toHaveCount(20)
    await expect(page.locator('#recherche [data-state]')).toHaveCount(0)
    await respondPaged(page, 25, 2)
    await page.getByRole('button', { name: 'Voir les 5 autres' }).click()
    await expect(page.getByRole('article')).toHaveCount(25)
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  // La région vocale persistante de la section : seule source des annonces
// d'état. Elle est toujours dans la page, seul son texte change.
const LIVE = '#recherche > p.sr-only[role="status"]'

test.describe('annonces vocales des états', () => {
  test('aucun panneau d’état ne porte role="status" : seule l’erreur a role="alert"', async ({ page }) => {
    for (const [state, status, body] of [['empty', 200, ok([])], ['rate-limited', 429, {}]] as const) {
      await respondWith(page, body, status)
      await page.goto(SEARCH)
      await expect(page.locator(`#recherche [data-state="${state}"]`)).toBeVisible()
      await expect(page.locator(`#recherche [data-state="${state}"]`)).not.toHaveAttribute('role', /.+/)
    }
    await respondWith(page, {}, 404)
    await page.goto(SEARCH)
    await expect(page.locator('#recherche [data-state="error"]')).toHaveAttribute('role', 'alert')
  })

  test('« aucun résultat » est annoncé par la région persistante', async ({ page }) => {
    await respondWith(page, ok([]))
    await page.goto(SEARCH)
    await expect(page.locator(LIVE)).toHaveText('Aucun voyageur pour Paris → Abidjan ce mois-ci.')
  })

  test('« trop de recherches » est annoncé par la région persistante', async ({ page }) => {
    await respondWith(page, {}, 429)
    await page.goto(SEARCH)
    await expect(page.locator(LIVE)).toHaveText('Doucement, trop de recherches d\'un coup.')
  })

  test('« Recherche en cours » est annoncé pendant le chargement, puis le titre des résultats', async ({ page }) => {
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => { release = resolve })
    await page.route(API, async (route: Route) => {
      await gate
      await route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(ok(THREE)) })
    })
    await page.goto(SEARCH)
    await expect(page.locator(LIVE)).toHaveText('Recherche en cours')
    release()
    await expect(page.locator(LIVE)).toHaveText('3 voyageurs pour Paris → Abidjan')
  })

  test('deux « Voir les autres » de même taille re-annoncent le même texte', async ({ page }) => {
    await respondPaged(page, 60, 3)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(20)
    await hydrated(page)
    await page.evaluate((selector) => {
      const region = document.querySelector(selector)!
      const seen: string[] = []
      ;(window as unknown as { __seen: string[] }).__seen = seen
      new MutationObserver(() => seen.push(region.textContent ?? '')).observe(region, { childList: true, characterData: true, subtree: true })
    }, LIVE)
    await page.getByRole('button', { name: 'Voir les 20 autres' }).click()
    await expect(page.getByRole('article')).toHaveCount(40)
    await page.getByRole('button', { name: 'Voir les 20 autres' }).click()
    await expect(page.getByRole('article')).toHaveCount(60)
    await expect(page.locator(LIVE)).toHaveText('20 voyageurs de plus affichés')
    const seen = await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen)
    const same = '20 voyageurs de plus affichés'
    const first = seen.indexOf(same)
    const second = seen.indexOf(same, first + 1)
    expect(first).toBeGreaterThanOrEqual(0)
    // Entre les deux annonces identiques, la région a été vidée.
    expect(second).toBeGreaterThan(first)
    expect(seen.slice(first, second)).toContain('')
  })
})

test('les états vide, erreur et 429 gardent un appel vers l’app', async ({ page }) => {
    const states: Array<[string, number, unknown]> = [
      ['empty', 200, ok([])],
      ['error', 404, {}],
      ['rate-limited', 429, {}],
    ]
    for (const [state, status, body] of states) {
      await respondWith(page, body, status)
      await page.goto(SEARCH)
      await expect(page.locator(`#recherche [data-state="${state}"]`)).toBeVisible()
      const badges = page.locator('#recherche aside')
      await expect(badges.getByRole('link', { name: /App Store/ })).toHaveAttribute('href', /apps\.apple\.com/)
      await expect(badges.getByRole('link', { name: /Google Play/ })).toHaveAttribute('href', /play\.google\.com/)
    }
  })

  test('une adresse avec paramètres amène la section à l’écran, l’adresse nue ne défile pas', async ({ page }) => {
    await respondWith(page, ok(THREE))
    await page.goto('/envoyer-colis')
    await page.waitForLoadState('networkidle')
    await hydrated(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await page.goto(SEARCH)
    await expect(page.getByRole('article')).toHaveCount(3)
    await expect.poll(() => page.evaluate(() => {
      const top = document.querySelector('#recherche')!.getBoundingClientRect().top
      return top >= -1 && top < window.innerHeight / 2
    })).toBe(true)
  })
})

for (const [label, path, search] of [
  ['FR', '/envoyer-colis', SEARCH],
  ['EN', '/en/send-a-parcel', '/en/send-a-parcel?depart=Paris&arrivee=Abidjan&quand=ce-mois'],
] as const) {
  test.describe(`360 px ${label}`, () => {
    test.use({ viewport: { width: 360, height: 800 } })

    test('aucun défilement horizontal, boutons sur une ligne', async ({ page }) => {
      await respondPaged(page, 45, 3)
      for (const url of [path, search]) {
        await page.goto(url)
        if (url === search) await expect(page.getByRole('button', { name: /Voir les 20 autres|See 20 more/ })).toBeVisible()
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, url).toBeLessThanOrEqual(0)
        if (url === search) {
          const box = (await page.getByRole('button', { name: /Voir les 20 autres|See 20 more/ }).boundingBox())!
          expect(box.height).toBeGreaterThanOrEqual(44)
          expect(box.x + box.width).toBeLessThanOrEqual(360)
        }
        // Une ligne = un seul `top` parmi les rectangles du texte du bouton.
        const wrapped = await page.evaluate(() =>
          [...document.querySelectorAll('main button, main a.rounded-btn, #recherche a')]
            .filter((el) => {
              // Le libellé caché du bouton occupé (`invisible`) ne compte pas.
              const tops = new Set<number>()
              const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
              for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                if (getComputedStyle(node.parentElement!).visibility === 'hidden') continue
                const range = document.createRange()
                range.selectNodeContents(node)
                for (const rect of range.getClientRects()) if (rect.width > 0) tops.add(Math.round(rect.top / 4))
              }
              return tops.size > 1
            })
            .map(el => el.textContent?.trim()),
        )
        expect(wrapped, url).toEqual([])
      }
    })

    test('le champ Prix max tient dans la largeur', async ({ page }) => {
      await page.goto(path)
      await hydrated(page)
      await page.getByRole('button', { name: /Prix max|Max price/ }).click()
      const input = page.locator('input[name="maxPrix"]')
      await expect(input).toBeVisible()
      const box = (await input.boundingBox())!
      expect(box.width).toBeLessThanOrEqual(160)
      expect(box.x + box.width).toBeLessThanOrEqual(360)
    })
  })
}

for (const [label, url] of [['FR', SEARCH], ['EN', '/en/send-a-parcel?depart=Paris&arrivee=Abidjan']] as const) {
  test(`axe : aucune violation grave avec des résultats (${label})`, async ({ page }) => {
    await respondPaged(page, 45, 3)
    await page.goto(url)
    await expect(page.getByRole('article')).toHaveCount(20)
    await expect(page.getByRole('button', { name: /Voir les 20 autres|See 20 more/ })).toBeVisible()
    await page.waitForLoadState('networkidle')
    const settled = () => document.getAnimations()
      .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
      .every(animation => animation.playState !== 'running')
    await page.waitForFunction(settled)
    await page.waitForTimeout(700)
    await page.waitForFunction(settled)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const serious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
    expect(serious.map(v => `${v.id} sur ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)).toEqual([])
  })
}

test('axe : aucune violation grave dans les états vide, erreur et 429', async ({ page }) => {
  for (const status of [200, 404, 429]) {
    await respondWith(page, status === 200 ? ok([]) : {}, status)
    await page.goto(SEARCH)
    await expect(page.locator('#recherche [data-state]')).toHaveCount(1)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(700)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const serious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
    expect(serious.map(v => `${v.id} sur ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`), String(status)).toEqual([])
  }
})

// Navigation interne vers une recherche : Nuxt remonte en haut de page à chaque
// changement de chemin, ce qui renvoyait les résultats hors de l'écran. La
// section de recherche doit rester visible, à 360 px comme sur grand écran.
async function sectionTop(page: Page): Promise<number> {
  return page.locator('#recherche').evaluate(el => el.getBoundingClientRect().top)
}

async function expectSectionInView(page: Page) {
  await expect.poll(async () => {
    const top = await sectionTop(page)
    return top >= 0 && top < 200
  }, { message: 'le haut de #recherche doit être à l’écran' }).toBe(true)
}

for (const size of [{ label: 'grand écran', width: 1280, height: 800 }, { label: '360 px', width: 360, height: 740 }]) {
  test.describe(`navigation interne vers une recherche (${size.label})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height })
    })

    test('un trajet fréquent de l’accueil laisse les résultats à l’écran', async ({ page }) => {
      await respondWith(page, ok(THREE))
      await page.goto('/')
      await hydrated(page)
      await page.getByRole('main').getByRole('link', { name: 'Paris → Abidjan' }).click()
      await expect(page.getByRole('article')).toHaveCount(3)
      await expectSectionInView(page)
    })

    test('l’envoi du formulaire de l’accueil laisse les résultats à l’écran', async ({ page }) => {
      await respondWith(page, ok(THREE))
      await page.goto('/')
      await hydrated(page)
      const form = page.getByRole('search')
      await form.getByLabel('Départ').fill('Paris')
      await form.getByLabel('Arrivée').fill('Abidjan')
      await form.getByRole('button', { name: 'Voir les voyageurs' }).click()
      await expect(page.getByRole('article')).toHaveCount(3)
      await expectSectionInView(page)
    })

    test('« Voir tous les départs » d’une page de trajet laisse les résultats à l’écran', async ({ page }) => {
      await respondWith(page, ok(THREE))
      await page.goto('/envoyer-colis/paris-abidjan')
      await hydrated(page)
      await page.getByRole('link', { name: 'Voir tous les départs' }).click()
      await expect(page.locator('#recherche').getByRole('article')).toHaveCount(3)
      await expectSectionInView(page)
    })
  })
}

test('« Envoyer un colis » de l’en-tête, sans recherche, remonte en haut de la page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await hydrated(page)
  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
  await page.locator('header nav[aria-label="Navigation principale"]').getByRole('link', { name: 'Envoyer un colis' }).click()
  await expect(page).toHaveURL(/\/envoyer-colis$/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('Précédent depuis une recherche rend à l’accueil sa position de défilement', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await respondWith(page, ok(THREE))
  await page.goto('/')
  await hydrated(page)
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400)
  await page.getByRole('main').getByRole('link', { name: 'Paris → Abidjan' }).click()
  await expect(page).toHaveURL(/depart=Paris&arrivee=Abidjan/)
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400)
})

test('une adresse de recherche rouverte avec Précédent amène encore les résultats à l’écran', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await respondWith(page, ok(THREE))
  await page.goto(SEARCH)
  await expect(page.getByRole('article')).toHaveCount(3)
  await hydrated(page)
  await page.getByRole('link', { name: 'Paris → Dakar' }).first().click()
  await expect(page).toHaveURL(/\/envoyer-colis\/paris-dakar$/)
  await page.goBack()
  await expect(page.getByRole('article')).toHaveCount(3)
  await expectSectionInView(page)
})

// Plan des titres : un seul h1, aucun niveau sauté, et les cartes un cran sous
// le titre des résultats.
async function outline(page: Page): Promise<Array<{ level: number; text: string }>> {
  return page.locator('main h1, main h2, main h3, main h4, main h5, main h6').evaluateAll(nodes =>
    nodes.map(node => ({ level: Number(node.tagName[1]), text: node.textContent?.trim() ?? '' })),
  )
}

for (const [label, url, resultsTitle] of [
  ['FR', SEARCH, '3 voyageurs pour Paris → Abidjan'],
  ['EN', '/en/send-a-parcel?depart=Paris&arrivee=Abidjan&quand=ce-mois', '3 travelers for Paris → Abidjan'],
] as const) {
  test(`titres de ${url.split('?')[0]} avec résultats (${label}) : aucun niveau sauté, cartes sous le titre des résultats`, async ({ page }) => {
    await respondWith(page, ok(THREE))
    await page.goto(url)
    await expect(page.getByRole('article')).toHaveCount(3)
    const headings = await outline(page)
    expect(headings[0]!.level).toBe(1)
    expect(headings.filter(h => h.level === 1)).toHaveLength(1)
    headings.slice(1).forEach((h, index) => expect(h.level - headings[index]!.level, `titre « ${h.text} »`).toBeLessThanOrEqual(1))
    expect(headings.find(h => h.text === resultsTitle)!.level).toBe(3)
    await expect(page.locator('#recherche article h4')).toHaveCount(3)
    await expect(page.locator('#recherche article h3')).toHaveCount(0)
  })
}
