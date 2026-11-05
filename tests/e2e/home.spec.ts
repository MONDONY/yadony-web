import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page, type Route } from './fixtures'

// Accueil centré sur la recherche publique. L'API est simulée par `page.route`
// (par défaut « aucun trajet » via la fixture commune, voir fixtures.ts) :
// aucun appel réel ne part du navigateur de test. Le formulaire est rendu côté
// serveur : ce qui est saisi avant l'hydratation est effacé, d'où `hydrated`.
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

const FOUR = [card('a1', 'Mariam S.'), card('a2', 'Oumar S.', { urgent: true }), card('a3', 'Voyageur D.'), card('a4', 'Quatrième Q.')]

function ok(content: unknown[]) {
  return { content, totalElements: content.length, page: 0, size: 20, totalPages: 1 }
}

async function respondWith(page: Page, body: unknown, status = 200) {
  await page.route(API, (route: Route) =>
    route.fulfill({ status, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) }),
  )
}

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

test.describe('haut de page', () => {
  test('un seul h1, la question posée au visiteur, et le titre ne parle pas de billets', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('Quel voyageur part vers chez vous ?')
    await expect(page.locator('title')).not.toHaveText(/billet/i)
  })

  test('le h1 anglais (texte à valider par le propriétaire)', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('Which traveler is heading your way?')
  })

  test('le formulaire est le premier contrôle atteignable après le lien d’évitement', async ({ page }) => {
    await page.goto('/')
    await hydrated(page)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: /contenu/i })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('search').getByLabel('Départ')).toBeFocused()
  })

  test('cinq trajets fréquents mènent à la recherche, avec la langue de la page', async ({ page }) => {
    await page.goto('/')
    const links = page.locator('main a[href^="/envoyer-colis?"]')
    await expect(links).toHaveCount(5)
    expect(await links.evaluateAll(els => els.map(el => el.getAttribute('href')))).toEqual([
      '/envoyer-colis?depart=Paris&arrivee=Dakar',
      '/envoyer-colis?depart=Paris&arrivee=Abidjan',
      '/envoyer-colis?depart=Paris&arrivee=Bamako',
      '/envoyer-colis?depart=Lyon&arrivee=Dakar',
      '/envoyer-colis?depart=Marseille&arrivee=Douala',
    ])
    await expect(links.first()).toHaveText('Paris → Dakar')

    await page.goto('/en')
    const english = page.locator('main a[href^="/en/send-a-parcel?"]')
    await expect(english).toHaveCount(5)
    await expect(english.nth(4)).toHaveAttribute('href', '/en/send-a-parcel?depart=Marseille&arrivee=Douala')
  })

  test('un trajet fréquent ouvre les résultats sur la page Envoyer un colis', async ({ page }) => {
    await respondWith(page, ok(FOUR.slice(0, 3)))
    await page.goto('/')
    await hydrated(page)
    await page.getByRole('main').getByRole('link', { name: 'Paris → Dakar' }).click()
    await expect(page).toHaveURL(/\/envoyer-colis\?depart=Paris&arrivee=Dakar$/)
    await expect(page.locator('#recherche').getByRole('article')).toHaveCount(3)
  })

  test('le formulaire de l’accueil n’a aucune puce de filtre : rien ne le quitte avant la saisie', async ({ page }) => {
    await page.goto('/')
    await hydrated(page)
    const form = page.getByRole('search')
    await expect(form.getByRole('button')).toHaveCount(1)
    await expect(form.getByRole('button', { name: 'Voir les voyageurs' })).toBeVisible()
    for (const name of ['Urgent', 'Avion', '≥ 16 kg', 'Prix max (€/kg)']) {
      await expect(form.getByRole('button', { name })).toHaveCount(0)
    }
    await expect(form.locator('[aria-pressed]')).toHaveCount(0)
    await expect(page).toHaveURL(/\/$/)
  })

  test('le formulaire envoie la recherche vers la page Envoyer un colis', async ({ page }) => {
    await respondWith(page, ok(FOUR.slice(0, 3)))
    await page.goto('/')
    await hydrated(page)
    const form = page.getByRole('search')
    await form.getByLabel('Départ').fill('Paris')
    await form.getByLabel('Arrivée').fill('Abidjan')
    await form.getByLabel('Quand').selectOption('ce-mois')
    await form.getByRole('button', { name: 'Voir les voyageurs' }).click()
    await expect(page).toHaveURL(/\/envoyer-colis\?depart=Paris&arrivee=Abidjan&quand=ce-mois$/)
    await expect(page.locator('#recherche').getByRole('article')).toHaveCount(3)
  })

  test('un envoi vide affiche tous les trajets, sans ville dans l’appel', async ({ page }) => {
    await respondWith(page, ok(FOUR.slice(0, 3)))
    const calls: URL[] = []
    page.on('request', (request) => {
      if (request.url().includes('/public/announcements')) calls.push(new URL(request.url()))
    })
    await page.goto('/')
    await hydrated(page)
    // Les prochains départs de l'accueil ont déjà appelé l'API : seul l'appel
    // de la recherche nous intéresse.
    await expect.poll(() => calls.length).toBe(1)
    calls.length = 0
    await page.getByRole('search').getByRole('button', { name: 'Voir les voyageurs' }).click()
    await expect(page).toHaveURL(/\/envoyer-colis\?tous=1$/)
    await expect(page.locator('#recherche').getByRole('article')).toHaveCount(3)
    await expect(page.getByRole('heading', { name: '3 voyageurs' })).toBeVisible()
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1)
    expect(calls).toHaveLength(1)
    expect(calls[0]!.searchParams.has('departureCity')).toBe(false)
    expect(calls[0]!.searchParams.has('arrivalCity')).toBe(false)
    expect(calls[0]!.searchParams.has('tous')).toBe(false)
  })

  test('en anglais, le formulaire mène à la page anglaise', async ({ page }) => {
    await respondWith(page, ok(FOUR.slice(0, 3)))
    await page.goto('/en')
    await hydrated(page)
    const form = page.getByRole('search')
    await form.getByLabel('From').fill('Paris')
    await form.getByLabel('To').fill('Dakar')
    await form.getByRole('button', { name: 'See travelers' }).click()
    await expect(page).toHaveURL(/\/en\/send-a-parcel\?depart=Paris&arrivee=Dakar$/)
  })

  test('l’accueil n’affiche jamais la liste des résultats de la recherche', async ({ page }) => {
    await respondWith(page, ok(FOUR))
    await page.goto('/')
    await hydrated(page)
    await page.getByRole('search').getByLabel('Départ').fill('Paris')
    await page.getByRole('search').getByRole('button', { name: 'Voir les voyageurs' }).click()
    await expect(page).toHaveURL(/\/envoyer-colis/)
    await page.goBack()
    await expect(page.locator('[data-state="loading"], [data-state="empty"], [data-state="error"], [data-state="rate-limited"]')).toHaveCount(0)
    await expect(page.locator('main article')).toHaveCount(0)
  })
})

test.describe('prochains départs', () => {
  test('trois départs seulement, une fois l’API répondue', async ({ page }) => {
    await respondWith(page, ok(FOUR))
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Prochains départs' })
    await expect(section).toBeVisible()
    await expect(section.getByRole('article')).toHaveCount(3)
    await expect(section).not.toContainText('Quatrième Q.')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Prochains départs')
  })

  test('sans filtre de ville', async ({ page }) => {
    await respondWith(page, ok(FOUR))
    const calls: URL[] = []
    page.on('request', request => { if (request.url().includes('/public/announcements')) calls.push(new URL(request.url())) })
    await page.goto('/')
    await expect(page.getByRole('region', { name: 'Prochains départs' })).toBeVisible()
    expect(calls).toHaveLength(1)
    expect(calls[0]!.searchParams.has('departureCity')).toBe(false)
    expect(calls[0]!.searchParams.has('arrivalCity')).toBe(false)
  })

  test('« Demander » ouvre la remise à l’app', async ({ page }) => {
    await respondWith(page, ok(FOUR))
    await page.goto('/')
    await hydrated(page)
    await page.getByRole('button', { name: /Demander à Mariam S\./ }).click()
    await expect(page.getByRole('dialog', { name: 'Pour réserver, passez par l\'app.' })).toBeVisible()
  })

  for (const [name, status, body] of [
    ['une erreur 500', 500, { message: 'boom' }],
    ['un 429', 429, { status: 429 }],
    ['une liste vide', 200, ok([])],
    ['une réponse illisible', 200, { oops: true }],
  ] as const) {
    test(`${name} laisse l’accueil intact : section absente, aucune erreur de la page`, async ({ page }) => {
      const problems: string[] = []
      // Le navigateur journalise lui-même « Failed to load resource » pour un
      // statut HTTP d'erreur de l'API simulée : seul ce message, pour cette
      // adresse, est toléré. Toute autre erreur console fait échouer le test.
      page.on('console', (message) => {
        if (message.type() !== 'error') return
        const apiStatus = /Failed to load resource/.test(message.text()) && message.location().url.includes('/public/announcements')
        if (!apiStatus) problems.push(message.text())
      })
      page.on('pageerror', error => problems.push(error.message))
      await respondWith(page, body, status)
      await page.goto('/')
      await hydrated(page)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText('Prochains départs')).toHaveCount(0)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.getByRole('search')).toBeVisible()
      await expect(page.locator('main article')).toHaveCount(0)
      expect(problems).toEqual([])
    })
  }

  test('une coupure réseau laisse l’accueil intact', async ({ page }) => {
    const problems: string[] = []
    // Une requête coupée est journalisée par le navigateur (net::ERR_FAILED) :
    // seul ce message, pour l'adresse de l'API, est toléré.
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      const cut = /Failed to load resource/.test(message.text()) && message.location().url.includes('/public/announcements')
      if (!cut) problems.push(message.text())
    })
    page.on('pageerror', error => problems.push(error.message))
    await page.route(API, route => route.abort())
    await page.goto('/')
    await hydrated(page)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Prochains départs')).toHaveCount(0)
    await expect(page.getByRole('search')).toBeVisible()
    expect(problems).toEqual([])
  })

  test('le HTML prérendu ne contient aucune donnée de voyageur', async ({ request }) => {
    for (const path of ['/', '/en']) {
      const html = await (await request.get(path)).text()
      expect(html).not.toMatch(/Prochains départs|Next departures/)
      expect(html).not.toContain('Mariam')
      expect(html).not.toContain('<article')
    }
  })
})

test.describe('sections de l’accueil', () => {
  test('Chercher ici, réserver dans l’app : trois étapes, sans téléchargement dans la section', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Chercher ici, réserver dans l\'app.' }) })
    await expect(section.locator('ol > li')).toHaveCount(3)
    await expect(section.getByRole('link')).toHaveCount(0)
    await expect(section.getByRole('button')).toHaveCount(0)
  })

  test('« Yadony aujourd’hui » : six entrées qui mènent aux bonnes pages', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Yadony aujourd\'hui.' }) })
    const links = section.getByRole('link')
    await expect(links).toHaveCount(6)
    expect(await links.evaluateAll(els => els.map(el => el.getAttribute('href')))).toEqual([
      '/envoyer-colis',
      '/devenir-voyageur',
      '/billets-avion',
      '/comment-ca-marche',
      '/envoyer-colis#destinataire',
      'https://pro.yadony.com',
    ])
    await expect(links.nth(5)).toHaveAttribute('target', '_blank')
    await links.nth(1).click()
    await expect(page).toHaveURL('/devenir-voyageur')
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test('le bloc voyageur mène à la page Devenir voyageur, sans action de l’app', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Vous voyagez ? Vendez vos kilos libres.' }) })
    await expect(section.getByRole('link')).toHaveCount(1)
    await expect(section.getByRole('link', { name: 'Devenir voyageur' })).toHaveAttribute('href', '/devenir-voyageur')
    await expect(section.getByText('Publier mon trajet')).toHaveCount(0)
    await expect(section.getByRole('button')).toHaveCount(0)
    await page.goto('/en')
    await expect(page.getByRole('main').getByRole('link', { name: 'Become a traveler' })).toHaveAttribute('href', '/en/become-a-traveler')
  })

  test('« Un suivi pour vos proches » amène la section Destinataire sous l’en-tête', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Yadony aujourd\'hui.' }) })
    await section.getByRole('link', { name: /Un suivi pour vos proches/ }).click()
    await expect(page).toHaveURL(/\/envoyer-colis#destinataire$/)
    const target = page.locator('#destinataire')
    await expect(target).toBeVisible()
    await expect.poll(async () => {
      const top = (await target.boundingBox())!.y
      const header = (await page.locator('header').first().boundingBox())!
      return top >= header.y + header.height - 1 && top < 200
    }).toBe(true)
  })

  test('l’ordre des sections est celui de la recherche d’abord, avec le bas de page de téléchargement', async ({ page }) => {
    await page.goto('/')
    const headings = await page.locator('main h2').allTextContents()
    expect(headings.map(h => h.trim())).toEqual([
      'Chercher ici, réserver dans l\'app.',
      'Vous voyagez ? Vendez vos kilos libres.',
      'Yadony aujourd\'hui.',
      'Ce qui manquait aux groupes WhatsApp',
      'Les questions qu\'on nous pose avant de télécharger',
      'Installez Yadony avant votre prochain voyage',
    ])
  })

  test('les badges des stores restent le seul moyen de télécharger l’app', async ({ page }) => {
    await page.goto('/')
    const liens = page.locator('main a[href*="apps.apple.com"], main a[href*="play.google.com"]')
    expect(await liens.count()).toBeGreaterThan(0)
    expect(await liens.evaluateAll(list => list.every(a => a.closest('[data-store-badges]') !== null))).toBe(true)
    await expect(page.locator('main a[href*="/ouvrir"], main a[href*="/open"]')).toHaveCount(0)
    await expect(page.locator('main canvas, main img[alt*="QR" i]')).toHaveCount(0)
  })
})

test.describe('plan des titres', () => {
  for (const path of ['/', '/en']) {
    test(`${path} avec les prochains départs : aucun niveau sauté, cartes en h3 sous un h2`, async ({ page }) => {
      await respondWith(page, ok(FOUR))
      await page.goto(path)
      await expect(page.locator('main article')).toHaveCount(3)
      const levels = await page.locator('main h1, main h2, main h3, main h4, main h5, main h6')
        .evaluateAll(nodes => nodes.map(node => Number(node.tagName[1])))
      expect(levels[0]).toBe(1)
      expect(levels.filter(level => level === 1)).toHaveLength(1)
      levels.slice(1).forEach((level, index) => expect(level - levels[index]!, `titre ${index + 1}`).toBeLessThanOrEqual(1))
      await expect(page.locator('main article h3')).toHaveCount(3)
      await expect(page.locator('main article h4')).toHaveCount(0)
    })
  }
})

test.describe('accessibilité', () => {
  for (const path of ['/', '/en']) {
    test(`${path} avec les prochains départs affichés : aucune violation critique`, async ({ page }) => {
      await respondWith(page, ok(FOUR))
      await page.goto(path)
      await expect(page.locator('main article')).toHaveCount(3)
      await page.waitForLoadState('networkidle')
      const settled = () => document.getAnimations()
        .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
        .every(animation => animation.playState !== 'running')
      await page.waitForFunction(settled)
      await page.waitForTimeout(700)
      await page.waitForFunction(settled)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      const serious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
      expect(serious.map(v => `${v.id} sur ${v.nodes.length} noeud(s)`)).toEqual([])
    })
  }
})

test.describe('sans JavaScript (robots, navigateurs limités)', () => {
  test.use({ javaScriptEnabled: false })

  test('le haut de page, les trajets fréquents et les sections sont dans le HTML prérendu', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('search')).toBeVisible()
    await expect(page.getByRole('main').getByRole('link', { name: 'Paris → Abidjan' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Chercher ici, réserver dans l\'app.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Yadony aujourd\'hui.' })).toBeVisible()
    await expect(page.getByText('Prochains départs')).toHaveCount(0)
  })
})

test.describe('téléphone étroit (360 px)', () => {
  test.use({ viewport: { width: 360, height: 760 } })

  for (const [path, submit, labels, travelerCta] of [
    ['/', 'Voir les voyageurs', ['Paris → Dakar', 'Marseille → Douala'], 'Devenir voyageur'],
    ['/en', 'See travelers', ['Paris → Dakar', 'Marseille → Douala'], 'Become a traveler'],
  ] as const) {
    test(`${path} : aucun débordement horizontal, libellés des boutons sur une ligne`, async ({ page }) => {
      await respondWith(page, ok(FOUR))
      await page.goto(path)
      await hydrated(page)
      await expect(page.locator('main article').first()).toBeVisible()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
      const button = page.getByRole('search').getByRole('button', { name: submit })
      await expect(button).toBeVisible()
      expect(await lineCount(button)).toBe(1)
      const link = (label: string) => page.getByRole('main').getByRole('link', { name: label })
      for (const label of labels) expect(await lineCount(link(label))).toBe(1)
      const request = page.locator('main article').first().locator('button')
      expect(await lineCount(request)).toBe(1)
      // Cibles tactiles d'au moins 44 px.
      for (const target of [button, link(labels[0]), request]) {
        expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
      // Bloc voyageur : son appel tient sur une ligne, à sa taille normale.
      const cta = page.getByRole('main').getByRole('link', { name: travelerCta })
      await cta.scrollIntoViewIfNeeded()
      expect(await lineCount(cta)).toBe(1)
      expect((await cta.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
    })
  }
})

// Parcours racontés, qui vivaient sur l'accueil et vivent désormais sur la page
// « Envoyer un colis » (même scène à sept étapes) : lisibles sans JavaScript,
// sur un téléphone étroit et en mouvement réduit, où chaque illustration
// montre directement son état final.
test.describe('parcours de la page Envoyer un colis', () => {
  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('les sept étapes sont dans le HTML prérendu et visibles', async ({ page }) => {
      await page.goto('/envoyer-colis')
      await expect(page.locator('h1')).toHaveCount(1)
      const steps = page.locator('.scene-step h3')
      await expect(steps).toHaveCount(7)
      for (const step of await steps.all()) await expect(step).toBeVisible()
    })

    test('le message WhatsApp et la page de suivi du destinataire sont visibles', async ({ page }) => {
      await page.goto('/envoyer-colis')
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
      await page.goto('/envoyer-colis')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
      const steps = page.locator('.scene-step h3')
      await expect(steps).toHaveCount(7)
      for (const step of await steps.all()) {
        await step.scrollIntoViewIfNeeded()
        await expect(step).toBeVisible()
      }
    })
  })
})

test.describe('mouvement réduit', () => {
  // `reducedMotion` n'est pas une option de test : on émule la préférence
  // avant chaque navigation.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('les illustrations du parcours (accord, cadenas ouvert, frise pleine) affichent directement leur état final', async ({ page, isMobile }) => {
    await page.goto('/envoyer-colis')
    // Sur grand écran, seul le visuel de l'étape active est montré : on amène
    // chaque étape à l'écran. Sur téléphone, chaque étape porte son visuel.
    const steps = page.locator('.scene-step')
    for (const step of await steps.all()) await step.scrollIntoViewIfNeeded()

    const scope = isMobile ? page.locator('.scene-step') : page.locator('main')
    await steps.nth(2).scrollIntoViewIfNeeded()
    await expect(scope.locator('[data-agreed][data-shown="true"]').first()).toBeVisible()
    // Dernière étape : le cadenas est déjà ouvert (sans jouer l'animation) et
    // la frise de suivi est pleine.
    await steps.nth(6).scrollIntoViewIfNeeded()
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
})
