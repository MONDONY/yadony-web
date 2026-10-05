import { test as base, expect } from '@playwright/test'
import { CONTEST_POPUP_KEY } from '../../app/lib/classement/popup'

/**
 * La fenêtre du concours s'ouvre à chaque nouvelle visite et piège le focus
 * (<dialog> modal) : les parcours qui ne la testent pas partent d'un onglet où
 * elle est déjà fermée pour la visite. tests/e2e/popup-concours.spec.ts
 * désactive l'option. Un onglet ouvert avec `context.newPage()` repart vierge.
 */
export const test = base.extend<{ popupDejaFermee: boolean }>({
  popupDejaFermee: [true, { option: true }],
  page: async ({ page, popupDejaFermee }, use) => {
    if (popupDejaFermee) {
      await page.addInitScript(cle => window.sessionStorage.setItem(cle, '1'), CONTEST_POPUP_KEY)
    }
    await use(page)
  },
})

export { expect }
export type { Locator, Page } from '@playwright/test'
