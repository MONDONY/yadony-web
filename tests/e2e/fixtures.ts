import { test as base, expect } from '@playwright/test'
import { CONTEST_POPUP_KEY } from '../../app/lib/classement/popup'
import { CONSENT_STORAGE_KEY } from '../../app/lib/consent'

/**
 * La fenêtre du concours s'ouvre à chaque nouvelle visite et piège le focus
 * (<dialog> modal) : les parcours qui ne la testent pas partent d'un onglet où
 * elle est déjà fermée pour la visite. tests/e2e/popup-concours.spec.ts
 * désactive l'option. Un onglet ouvert avec `context.newPage()` repart vierge.
 *
 * La fenêtre attend aussi que la bannière cookies soit tranchée : l'option
 * `cookiesTranches` (fausse par défaut, pour que les autres suites voient la
 * bannière) enregistre un choix avant le chargement.
 */
export const test = base.extend<{ popupDejaFermee: boolean; cookiesTranches: boolean }>({
  popupDejaFermee: [true, { option: true }],
  cookiesTranches: [false, { option: true }],
  page: async ({ page, popupDejaFermee, cookiesTranches }, use) => {
    if (popupDejaFermee) {
      await page.addInitScript(cle => window.sessionStorage.setItem(cle, '1'), CONTEST_POPUP_KEY)
    }
    if (cookiesTranches) {
      await page.addInitScript(cle => window.localStorage.setItem(cle, 'refused'), CONSENT_STORAGE_KEY)
    }
    await use(page)
  },
})

export { expect }
export type { Locator, Page } from '@playwright/test'
