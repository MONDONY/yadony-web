import { ref } from 'vue'
import { toApiParams, type PublicAnnouncementCard, type PublicPage, type SearchQuery } from '@/lib/public-search'

export type SearchStatus = 'idle' | 'loading' | 'ok' | 'empty' | 'error' | 'rate-limited'

// Recherche publique côté navigateur uniquement : aucun appel pendant le rendu
// serveur, l'appelant déclenche `run` depuis `onMounted`. Le GET est « simple »
// (aucun en-tête personnalisé, pas de cookies) pour éviter la pré-vérification
// CORS, qui consommerait le budget de 30 requêtes par minute. Un 429 produit
// par Nginx n'a pas d'en-têtes CORS : le navigateur le rapporte comme une
// erreur réseau, d'où `error` en pratique. Aucune relance automatique.
export function usePublicSearch() {
  const status = ref<SearchStatus>('idle')
  const results = ref<PublicAnnouncementCard[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  let current: AbortController | null = null

  // `q` doit être issu de `parseSearchQuery` : `toApiParams` ne borne rien.
  async function run(q: SearchQuery): Promise<void> {
    current?.abort()
    const controller = new AbortController()
    current = controller
    status.value = 'loading'
    const isStale = () => controller.signal.aborted
    // La date du jour est celle du navigateur, jamais celle du serveur.
    const url = `${useRuntimeConfig().public.apiBase}/public/announcements?${toApiParams(q, new Date())}`
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', signal: controller.signal })
      if (response.status === 429) return settle(isStale, 'rate-limited')
      if (!response.ok) return settle(isStale, 'error')
      const body = await response.json() as PublicPage
      if (isStale()) return
      if (!Array.isArray(body.content)) return settle(isStale, 'error')
      if (body.content.length === 0) return settle(isStale, 'empty')
      results.value = body.content
      total.value = body.totalElements
      totalPages.value = body.totalPages > 0 ? body.totalPages : 1
      status.value = 'ok'
    } catch {
      settle(isStale, 'error')
    }
  }

  function settle(isStale: () => boolean, next: SearchStatus) {
    if (isStale()) return
    results.value = []
    total.value = 0
    totalPages.value = 0
    status.value = next
  }

  return { status, results, total, totalPages, run }
}
