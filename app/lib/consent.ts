// Gestion du consentement cookies. Le site ne pose aujourd'hui aucun cookie
// tiers ni traceur : le seul stockage est le choix du visiteur lui-même,
// conservé en localStorage pour ne pas réafficher la bannière.

export type ConsentValue = 'accepted' | 'refused'

export const CONSENT_STORAGE_KEY = 'yadony-cookie-consent'

/** Valide une valeur brute lue en localStorage (potentiellement corrompue). */
export function parseConsent(raw: string | null): ConsentValue | null {
  return raw === 'accepted' || raw === 'refused' ? raw : null
}

/** Le bandeau doit s'afficher tant qu'aucun choix valide n'est enregistré. */
export function shouldShowBanner(raw: string | null): boolean {
  return parseConsent(raw) === null
}
