import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Les autres suites partent d'un navigateur où la fenêtre est déjà fermée
// (storageState de playwright.config.ts) ; ici, on repart d'un navigateur vierge.
test.use({ storageState: { cookies: [], origins: [] } })

const PENDANT = new Date('2026-10-06T10:00:00Z')
const AVANT = new Date('2026-10-05T12:00:00Z')
const APRES = new Date('2026-10-13T00:00:00Z')

function fenetre(page: Page) {
  return page.getByRole('dialog', { name: /meilleur bêta-testeur/i })
}

test('la fenêtre du concours s’ouvre à l’arrivée et mène au classement', async ({ page }) => {
  await page.clock.setFixedTime(PENDANT)
  await page.goto('/')
  await expect(fenetre(page)).toBeVisible()
  await expect(fenetre(page)).toContainText(/jeu concours en cours/i)
  await expect(fenetre(page)).toContainText(/fin dans/i)
  await fenetre(page).getByRole('link', { name: /voir le classement/i }).click()
  await expect(page).toHaveURL(/\/classement\/?$/)
  await expect(fenetre(page)).toHaveCount(0)
})

test('la fenêtre se ferme avec la croix et ne revient plus', async ({ page }) => {
  await page.clock.setFixedTime(PENDANT)
  await page.goto('/')
  await fenetre(page).getByRole('button', { name: 'Fermer' }).click()
  await expect(fenetre(page)).toBeHidden()
  await page.reload()
  await page.waitForTimeout(1500)
  await expect(fenetre(page)).toBeHidden()
})

test('la fenêtre se ferme avec « Plus tard » et avec Échap', async ({ page }) => {
  await page.clock.setFixedTime(PENDANT)
  await page.goto('/tarifs')
  await fenetre(page).getByRole('button', { name: 'Plus tard' }).click()
  await expect(fenetre(page)).toBeHidden()

  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(fenetre(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(fenetre(page)).toBeHidden()
})

test('la fenêtre annonce le départ avant 20 h 30', async ({ page }) => {
  await page.clock.setFixedTime(AVANT)
  await page.goto('/')
  await expect(fenetre(page)).toContainText(/dès le/i)
  await expect(fenetre(page)).toContainText(/début dans/i)
})

test('la fenêtre ne s’ouvre pas sur la page du classement', async ({ page }) => {
  await page.clock.setFixedTime(PENDANT)
  await page.goto('/classement')
  await page.waitForTimeout(1500)
  await expect(fenetre(page)).toHaveCount(0)
})

test('la fenêtre ne s’ouvre plus après la fin du concours', async ({ page }) => {
  await page.clock.setFixedTime(APRES)
  await page.goto('/')
  await page.waitForTimeout(1500)
  await expect(fenetre(page)).toHaveCount(0)
})

test('la fenêtre existe en anglais', async ({ page }) => {
  await page.clock.setFixedTime(PENDANT)
  await page.goto('/en/')
  await expect(page.getByRole('dialog', { name: /top yadony beta tester/i })).toBeVisible()
})

test('la fenêtre ouverte ne présente aucune violation d’accessibilité grave', async ({ page }) => {
  await page.clock.setFixedTime(PENDANT)
  await page.goto('/')
  await expect(fenetre(page)).toBeVisible()
  // Le contenu arrive en fondu échelonné : analysé en cours d'animation, le
  // texte encore translucide fausserait le contraste. On attend la fin.
  await expect(fenetre(page).locator('.s5')).toHaveCSS('opacity', '1')
  await expect(fenetre(page).locator('.s5')).toHaveCSS('filter', 'none')
  const results = await new AxeBuilder({ page })
    .include('dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
  expect(serious.map(v => `${v.id} sur ${v.nodes.length} noeud(s)`)).toEqual([])
})
