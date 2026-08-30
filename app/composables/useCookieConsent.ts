import { CONSENT_STORAGE_KEY, parseConsent, type ConsentValue } from '@/lib/consent'

// État partagé entre la bannière et le bouton « Gérer les cookies » du footer.
// localStorage peut être indisponible (navigation privée stricte, iframe) :
// chaque accès est protégé, et l'absence de stockage laisse la bannière
// visible à chaque visite, ce qui reste un comportement correct.
export function useCookieConsent() {
  const consent = useState<ConsentValue | null>('cookie-consent', () => null)
  const hydrated = useState<boolean>('cookie-consent-hydrated', () => false)

  function readStored(): ConsentValue | null {
    try {
      return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY))
    } catch {
      return null
    }
  }

  function hydrate() {
    consent.value = readStored()
    hydrated.value = true
  }

  function choose(value: ConsentValue) {
    consent.value = value
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value)
    } catch {
      // Sans stockage, le choix ne vaut que pour la page en cours.
    }
  }

  function reopen() {
    consent.value = null
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    } catch {
      // Ignoré : même raison que ci-dessus.
    }
  }

  return { consent, hydrated, hydrate, choose, reopen }
}
