import { test, expect, type Page, type Locator } from '@playwright/test'

// La configuration i18n (nuxt.config.ts) déclare l'anglais avec la balise
// IETF `en-GB`, cohérente avec `ogLocale: 'en_GB'` déjà vérifié par
// tests/unit/lib/seo.spec.ts. C'est un choix délibéré (anglais britannique,
// pas un code générique) : `<html lang>` doit donc valoir "en-GB", pas "en".
test('le sélecteur de langue conserve la page équivalente', async ({ page }) => {
  await page.goto('/tarifs')
  await page.getByRole('link', { name: /English/i }).click()
  await expect(page).toHaveURL('/en/pricing')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB')
})

test('le sélecteur de langue conserve la page équivalente pour comment-ca-marche', async ({ page }) => {
  await page.goto('/comment-ca-marche')
  await page.getByRole('link', { name: /English/i }).click()
  await expect(page).toHaveURL('/en/how-it-works')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB')
})

test('chaque page déclare ses hreflang', async ({ page }) => {
  await page.goto('/tarifs')
  await expect(page.locator('link[hreflang="fr"]')).toHaveCount(1)
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1)
  await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1)
})

test('les onglets de rôle sont pilotés par l’URL', async ({ page }) => {
  await page.goto('/comment-ca-marche?role=voyageur')
  await expect(page.getByRole('tab', { name: /voyageur/i })).toHaveAttribute('aria-selected', 'true')
})

test.describe('onglets de rôle : navigation clavier', () => {
  // `locator.click()` attend qu'un élément soit visible, stable et qu'il
  // reçoive les événements pointeur — mais rien ne garantit que Nuxt ait
  // fini d'hydrater le composant (donc attaché son écouteur `@click`) au
  // moment précis où Playwright clique juste après `page.goto()` : la
  // vérification d'actionabilité de Playwright porte sur le DOM, pas sur
  // l'attachement des écouteurs Vue. `clickTab` répète le clic jusqu'à ce
  // que l'état attendu apparaisse, ce qui absorbe cette fenêtre
  // d'hydratation sans jamais assouplir ce qui est vérifié.
  async function clickTab(tab: Locator) {
    await expect(async () => {
      await tab.click()
      await expect(tab).toHaveAttribute('aria-selected', 'true')
    }).toPass({ timeout: 15_000 })
  }

  async function warmUp(page: Page) {
    const expediteurTab = page.getByRole('tab', { name: /expéditeur/i })
    const voyageurTab = page.getByRole('tab', { name: /voyageur/i })
    await clickTab(voyageurTab)
    await clickTab(expediteurTab)
    return { expediteurTab, voyageurTab }
  }

  test('la flèche droite avance et boucle sur le premier onglet', async ({ page }) => {
    await page.goto('/comment-ca-marche')
    const { expediteurTab, voyageurTab } = await warmUp(page)

    await expediteurTab.focus()
    await page.keyboard.press('ArrowRight')
    await expect(voyageurTab).toBeFocused()
    await expect(voyageurTab).toHaveAttribute('aria-selected', 'true')

    // Boucle : depuis le dernier onglet, la flèche droite revient au premier.
    await page.keyboard.press('ArrowRight')
    await expect(expediteurTab).toBeFocused()
    await expect(expediteurTab).toHaveAttribute('aria-selected', 'true')
  })

  test('la flèche gauche depuis le premier onglet boucle sur le dernier', async ({ page }) => {
    await page.goto('/comment-ca-marche')
    const { expediteurTab, voyageurTab } = await warmUp(page)

    await expediteurTab.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(voyageurTab).toBeFocused()
    await expect(voyageurTab).toHaveAttribute('aria-selected', 'true')
  })

  test('Home et End sautent au premier et au dernier onglet', async ({ page }) => {
    await page.goto('/comment-ca-marche')
    const { expediteurTab, voyageurTab } = await warmUp(page)

    await voyageurTab.focus()
    await page.keyboard.press('Home')
    await expect(expediteurTab).toBeFocused()
    await expect(expediteurTab).toHaveAttribute('aria-selected', 'true')

    await page.keyboard.press('End')
    await expect(voyageurTab).toBeFocused()
    await expect(voyageurTab).toHaveAttribute('aria-selected', 'true')
  })

  test('seul l’onglet sélectionné est dans l’ordre de tabulation', async ({ page }) => {
    await page.goto('/comment-ca-marche')
    const expediteurTab = page.getByRole('tab', { name: /expéditeur/i })
    const voyageurTab = page.getByRole('tab', { name: /voyageur/i })

    await expect(expediteurTab).toHaveAttribute('tabindex', '0')
    await expect(voyageurTab).toHaveAttribute('tabindex', '-1')

    await clickTab(voyageurTab)
    await expect(voyageurTab).toHaveAttribute('tabindex', '0')
    await expect(expediteurTab).toHaveAttribute('tabindex', '-1')
  })

  test('changer d’onglet ne crée pas d’entrée d’historique', async ({ page }) => {
    // On part de l'accueil pour avoir une entrée d'historique à laquelle
    // revenir : si le changement d'onglet utilisait `router.push`, le
    // retour arrière resterait sur /comment-ca-marche (sans le paramètre
    // de rôle) au lieu de quitter la page.
    await page.goto('/')
    await page.goto('/comment-ca-marche')
    await clickTab(page.getByRole('tab', { name: /voyageur/i }))
    await expect(page).toHaveURL(/role=voyageur/)

    await page.goBack()
    await expect(page).toHaveURL('/')
  })
})
