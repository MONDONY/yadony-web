/**
 * Code de parrainage lu dans l'URL de la page d'invitation.
 *
 * Le lien partagé par l'app (`https://yadony.com/r/{code}`, construit par
 * ReferralService côté yadony-back) est redirigé par `public/_redirects` vers
 * `/parrainage?code={code}` (et `/en/r/{code}` vers `/en/referral?code=`).
 * La page est prérendue sans le code : il n'est connu qu'au chargement, côté
 * client, et vient d'une URL que n'importe qui peut forger. Seule une chaîne
 * courte de lettres, chiffres et tirets est acceptée ; tout le reste est ignoré
 * et la page devient une invitation générique, sans code.
 *
 * Les codes émis par le back sont en majuscules (4 lettres + 4 chiffres, ex.
 * ABOU1890) : un code saisi ou recopié en minuscules est remis en majuscules.
 */
const CODE_PATTERN = /^[A-Za-z0-9-]{4,20}$/

export function parseReferralCode(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return CODE_PATTERN.test(trimmed) ? trimmed.toUpperCase() : null
}

/**
 * Lien custom scheme qui ouvre l'app Yadony sur l'écran d'inscription avec le
 * code prérempli. Contrat avec dony_app : `yadony://referral?code={CODE}`.
 */
export function referralAppLink(code: string): string {
  return `yadony://referral?code=${encodeURIComponent(code)}`
}
