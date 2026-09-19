/**
 * Code de parrainage lu dans l'URL de la page d'atterrissage.
 *
 * Le lien partagé par l'app (`https://yadony.com/r/{code}`) est réécrit par
 * `public/_redirects` vers `/parrainage?code={code}`. La page est prérendue
 * sans le code : il n'est connu qu'au chargement, côté client, et vient d'une
 * URL que n'importe qui peut forger. Seule une chaîne courte, sans espace ni
 * caractère spécial, est acceptée ; tout le reste est ignoré et la page se
 * comporte comme si aucun code n'était donné.
 */
const CODE_PATTERN = /^[A-Za-z0-9_-]{3,24}$/

export function parseReferralCode(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return CODE_PATTERN.test(trimmed) ? trimmed : null
}
