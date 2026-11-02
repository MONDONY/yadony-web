import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect, type Page } from './fixtures'

// Les cinq textes légaux, dans les deux langues, avec l'adresse de chacun.
const PAGES = [
  { name: 'cgu.fr', path: '/cgu', toc: 'Sommaire', crumb: 'Accueil' },
  { name: 'cgu.en', path: '/en/terms', toc: 'Table of contents', crumb: 'Home' },
  { name: 'confidentialite.fr', path: '/confidentialite', toc: 'Sommaire', crumb: 'Accueil' },
  { name: 'confidentialite.en', path: '/en/privacy', toc: 'Table of contents', crumb: 'Home' },
  { name: 'mentions-legales.fr', path: '/mentions-legales', toc: 'Sommaire', crumb: 'Accueil' },
  { name: 'mentions-legales.en', path: '/en/legal-notice', toc: 'Table of contents', crumb: 'Home' },
  { name: 'cookies.fr', path: '/cookies', toc: 'Sommaire', crumb: 'Accueil' },
  { name: 'cookies.en', path: '/en/cookies', toc: 'Table of contents', crumb: 'Home' },
  { name: 'suppression-compte.fr', path: '/suppression-compte', toc: 'Sommaire', crumb: 'Accueil' },
  { name: 'suppression-compte.en', path: '/en/delete-account', toc: 'Table of contents', crumb: 'Home' },
]

// Texte du corps de la page (titres, paragraphes, puces), hors fil d'Ariane et
// sommaire. Les fichiers de référence de `__fixtures__/legal/` ont été captés
// AVANT l'introduction de la mise en page commune : tant qu'ils concordent,
// le texte juridique n'a pas bougé d'un caractère.
const bodyText = (page: Page) =>
  page.evaluate(
    () =>
      [...document.querySelectorAll('main :is(h1,h2,h3,p,li):not(nav *)')]
        .map(el => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
        .join('\n') + '\n',
  )

const reference = (name: string) =>
  readFileSync(join(process.cwd(), 'tests/e2e/__fixtures__/legal', `${name}.txt`), 'utf8')

async function openToc(page: Page, isMobile: boolean, label: string) {
  const nav = page.getByRole('navigation', { name: label })
  if (isMobile) {
    // Le clic ne compte qu'une fois la page hydratée : on le répète jusqu'à
    // ce que le sommaire soit déplié.
    const button = page.locator('main').getByRole('button', { name: /Sommaire|Contents/ })
    await expect(async () => {
      if ((await button.getAttribute('aria-expanded')) !== 'true') await button.click()
      await expect(button).toHaveAttribute('aria-expanded', 'true', { timeout: 500 })
    }).toPass()
  }
  return nav
}

for (const { name, path, toc, crumb } of PAGES) {
  test.describe(`${path}`, () => {
    test('un seul h1, un fil d’Ariane et un sommaire', async ({ page, isMobile }) => {
      await page.goto(path)
      await expect(page.locator('h1')).toHaveCount(1)
      const crumbs = page.locator('main nav').first()
      await expect(crumbs.getByRole('link', { name: crumb })).toBeVisible()
      await expect(crumbs.locator('[aria-current="page"]')).toHaveText(await page.locator('h1').innerText())
      const nav = await openToc(page, isMobile, toc)
      await expect(nav).toBeVisible()
      expect(await nav.getByRole('link').count()).toBeGreaterThan(0)
    })

    test('chaque entrée du sommaire mène à un vrai titre de section', async ({ page }) => {
      await page.goto(path)
      const headings = await page.locator('main h2[id]').evaluateAll(list =>
        list.map(el => ({ id: el.id, text: (el.textContent ?? '').trim() })),
      )
      expect(headings.length).toBeGreaterThan(0)
      expect(await page.locator('main h2').count()).toBe(headings.length)
      // Lu dans le DOM prérendu, sommaire replié ou non : l'ordre et les libellés
      // ne dépendent pas de l'état d'ouverture.
      const entries = await page.locator(`main nav[aria-label="${toc}"] a`).evaluateAll(list =>
        list.map(el => ({ href: el.getAttribute('href'), text: (el.textContent ?? '').trim() })),
      )
      expect(entries).toEqual(headings.map(h => ({ href: `#${h.id}`, text: h.text })))
    })

    test('le texte juridique est identique à la référence captée avant la mise en page', async ({ page }) => {
      await page.goto(path)
      expect(await bodyText(page)).toBe(reference(name))
    })
  })
}

test('un clic dans le sommaire amène à la section', async ({ page, isMobile }) => {
  await page.goto('/cgu')
  const nav = await openToc(page, isMobile, 'Sommaire')
  const link = nav.getByRole('link').nth(4)
  const target = (await link.getAttribute('href'))!.slice(1)
  await link.click()
  await expect(page).toHaveURL(new RegExp(`#${target}$`))
  await expect(page.locator(`#${target}`)).toBeInViewport()
})

// Le défilement est progressif (scroll-behavior: smooth) : on attend que la
// position verticale ne bouge plus avant de mesurer.
async function scrollSettled(page: Page) {
  let last = -1
  await expect.poll(async () => {
    const y = await page.evaluate(() => window.scrollY)
    const stable = y === last && y > 0
    last = y
    return stable
  }, { intervals: [150], timeout: 8000 }).toBe(true)
}

// L'en-tête est collant (bandeau bêta compris, environ 102 px) : le titre atteint
// par le sommaire et le sommaire collant ne doivent pas passer dessous.
test('après un clic dans le sommaire, le titre reste sous l’en-tête collant', async ({ page, isMobile }) => {
  await page.goto('/cgu')
  const nav = await openToc(page, isMobile, 'Sommaire')
  const link = nav.getByRole('link').nth(4)
  const target = (await link.getAttribute('href'))!.slice(1)
  await link.click()
  await expect(page).toHaveURL(new RegExp(`#${target}$`))
  const top = () => page.locator(`#${target}`).evaluate(el => el.getBoundingClientRect().top)
  const bottom = () => page.locator('header').first().evaluate(el => el.getBoundingClientRect().bottom)
  await scrollSettled(page)
  expect(await top()).toBeGreaterThanOrEqual(await bottom())
})

test('sur grand écran, le sommaire collant reste sous l’en-tête', async ({ page, isMobile }) => {
  test.skip(isMobile, 'comportement grand écran')
  await page.goto('/cgu')
  // Un défilement lancé avant l'hydratation est perdu : on le relance.
  await expect(async () => {
    await page.evaluate(() => window.scrollTo(0, 3000))
    await scrollSettled(page)
  }).toPass({ timeout: 15000 })
  const nav = page.getByRole('navigation', { name: 'Sommaire' })
  const toc = await nav.evaluate(el => el.getBoundingClientRect().top)
  const header = await page.locator('header').first().evaluate(el => el.getBoundingClientRect().bottom)
  expect(toc).toBeGreaterThanOrEqual(header)
})

test('sur grand écran, le sommaire est déplié et reste visible au défilement', async ({ page, isMobile }) => {
  test.skip(isMobile, 'comportement grand écran')
  await page.goto('/cgu')
  const nav = page.getByRole('navigation', { name: 'Sommaire' })
  await expect(nav).toBeVisible()
  await expect(page.locator('main').getByRole('button', { name: 'Sommaire' })).toBeHidden()
  await expect(nav).toHaveCSS('position', 'sticky')
  await page.evaluate(() => window.scrollTo(0, 3000))
  await expect(nav).toBeInViewport()
})

test('sur mobile, le sommaire est replié puis se déplie à la demande', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'comportement mobile')
  await page.goto('/cgu')
  const button = page.locator('main').getByRole('button', { name: 'Sommaire' })
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: /^Article 1\./ })).toBeHidden()
  const box = (await button.boundingBox())!
  expect(box.height).toBeGreaterThanOrEqual(44)
  await button.click()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('navigation', { name: 'Sommaire' }).getByRole('link').first()).toBeVisible()
})

for (const { path, label } of [
  { path: '/confidentialite', label: 'Sommaire' },
  { path: '/en/privacy', label: 'Contents' },
]) {
  test(`${path} : le bouton du sommaire tient sur une ligne à 360 px`, async ({ page, isMobile }) => {
    test.skip(!isMobile, 'comportement mobile')
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto(path)
    const button = page.locator('main').getByRole('button', { name: label })
    const box = (await button.boundingBox())!
    expect(box.height).toBeLessThan(60)
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
  })
}

for (const { path, crumb } of [
  { path: '/mentions-legales', crumb: 'Accueil' },
  { path: '/en/legal-notice', crumb: 'Home' },
]) {
  test(`${path} : le lien « ${crumb} » du fil d’Ariane est une cible de 44 px, sur une ligne à 360 px`, async ({ page, isMobile }) => {
    test.skip(!isMobile, 'comportement mobile')
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto(path)
    const crumbs = page.locator('main nav').first()
    const link = crumbs.getByRole('link', { name: crumb })
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    expect((await crumbs.boundingBox())!.height).toBeLessThan(60)
  })
}

test('le lien du fil d’Ariane mesure au moins 44 px sur grand écran', async ({ page, isMobile }) => {
  test.skip(isMobile, 'comportement grand écran')
  for (const [path, name] of [['/cgu', 'Accueil'], ['/en/terms', 'Home']]) {
    await page.goto(path!)
    const link = page.locator('main nav').first().getByRole('link', { name })
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
})
