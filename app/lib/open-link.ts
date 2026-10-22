/**
 * Lien « Ouvrir dans l'app » des e-mails de notification.
 *
 * Contrat avec yadony-back (NotificationOpenLink) et dony_app (open_deep_link.dart) :
 * `https://yadony.com/ouvrir?type=BID_ACCEPTED&bidId={uuid}`. Sur un téléphone où
 * l'app est installée, iOS (liens universels) et Android (App Links) l'ouvrent
 * directement dans l'app, sans passer par cette page. Elle ne s'affiche que si l'app
 * est absente, ou sur ordinateur : bouton vers l'app (`yadony://open?...`) et liens
 * vers les stores.
 *
 * L'URL est forgeable par n'importe qui : seuls un type en majuscules et des
 * identifiants UUID sont acceptés, le reste est ignoré.
 */
const TYPE_PATTERN = /^[A-Z][A-Z0-9_]{2,63}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Identifiants de charge utile lus par resolveNotificationRoute (dony_app). */
export const OPEN_LINK_ID_KEYS = [
  'bidId',
  'announcementId',
  'requestId',
  'threadId',
  'cancellationId',
  'packageRequestId',
  'conversationId',
  'alertId',
] as const

export interface OpenLink {
  type: string
  ids: Record<string, string>
}

function first(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' ? value.trim() : null
}

export function parseOpenLink(query: Record<string, unknown>): OpenLink | null {
  const type = first(query.type)
  if (!type || !TYPE_PATTERN.test(type)) return null
  const ids: Record<string, string> = {}
  for (const key of OPEN_LINK_ID_KEYS) {
    const value = first(query[key])
    if (value && UUID_PATTERN.test(value)) ids[key] = value.toLowerCase()
  }
  return { type, ids }
}

/** Lien custom scheme équivalent : `yadony://open?type=...&bidId=...`. */
export function openLinkAppUrl(link: OpenLink): string {
  const params = new URLSearchParams({ type: link.type, ...link.ids })
  return `yadony://open?${params.toString()}`
}
