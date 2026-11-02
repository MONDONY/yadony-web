import { computed, ref } from 'vue'
import {
  MAX_PAGE,
  toApiParams,
  type PublicAnnouncementCard,
  type PublicPage,
  type SearchQuery,
} from '@/lib/public-search'

export type SearchStatus = 'idle' | 'loading' | 'ok' | 'empty' | 'error' | 'rate-limited'

// Recherche publique côté navigateur uniquement : aucun appel pendant le rendu
// serveur, l'appelant déclenche `run` depuis `onMounted`. Le GET est « simple »
// (aucun en-tête personnalisé, pas de cookies) pour éviter la pré-vérification
// CORS, qui consommerait le budget de 30 requêtes par minute. Un 429 produit
// par Nginx n'a pas d'en-têtes CORS : le navigateur le rapporte comme une
// erreur réseau, d'où `error` en pratique. Aucune relance automatique.
//
// `more` charge la page suivante et l'AJOUTE aux résultats. Il ne repasse pas
// par `loading` (les cartes restent à l'écran) et son échec ne remplace rien :
// `moreError` suffit à l'appelant pour signaler le problème près du bouton.
export function usePublicSearch() {
  const status = ref<SearchStatus>('idle')
  const results = ref<PublicAnnouncementCard[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  const pageSize = ref(0)
  const loadedPage = ref(0)
  const loadingMore = ref(false)
  const moreError = ref(false)
  let lastQuery: SearchQuery | null = null
  let current: AbortController | null = null

  // Nombre de cartes que « Voir les autres » ajoutera : 0 quand tout est
  // affiché ou que la dernière page atteignable est chargée.
  const remaining = computed(() => {
    if (status.value !== 'ok' || pageSize.value <= 0) return 0
    if (loadedPage.value >= MAX_PAGE || loadedPage.value + 1 >= totalPages.value) return 0
    return Math.max(0, Math.min(pageSize.value, total.value - results.value.length))
  })

  // La date du jour est celle du navigateur, jamais celle du serveur.
  function fetchPage(q: SearchQuery, signal: AbortSignal): Promise<Response> {
    const url = `${useRuntimeConfig().public.apiBase}/public/announcements?${toApiParams(q, new Date())}`
    return fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', signal })
  }

  // `q` doit être issu de `parseSearchQuery` : `toApiParams` ne borne rien.
  async function run(q: SearchQuery): Promise<void> {
    current?.abort()
    const controller = new AbortController()
    current = controller
    lastQuery = q
    loadingMore.value = false
    moreError.value = false
    status.value = 'loading'
    const isStale = () => controller.signal.aborted
    try {
      const response = await fetchPage(q, controller.signal)
      if (response.status === 429) return settle(isStale, 'rate-limited')
      if (!response.ok) return settle(isStale, 'error')
      const body = await response.json() as PublicPage
      if (isStale()) return
      if (!Array.isArray(body.content)) return settle(isStale, 'error')
      if (body.content.length === 0) return settle(isStale, 'empty')
      results.value = body.content
      total.value = body.totalElements
      totalPages.value = body.totalPages > 0 ? body.totalPages : 1
      pageSize.value = body.size > 0 ? body.size : body.content.length
      loadedPage.value = q.page
      status.value = 'ok'
    } catch {
      settle(isStale, 'error')
    }
  }

  // Ajoute la page suivante. Rend le nombre de cartes ajoutées (0 si rien n'a
  // été chargé : rien à charger, déjà en cours, échec ou recherche remplacée).
  async function more(): Promise<number> {
    if (!lastQuery || remaining.value === 0 || loadingMore.value) return 0
    current?.abort()
    const controller = new AbortController()
    current = controller
    const isStale = () => controller.signal.aborted
    const next = loadedPage.value + 1
    loadingMore.value = true
    moreError.value = false
    try {
      const response = await fetchPage({ ...lastQuery, page: next }, controller.signal)
      if (!response.ok) return failMore(isStale)
      const body = await response.json() as PublicPage
      if (isStale()) return 0
      if (!Array.isArray(body.content)) return failMore(isStale)
      // Les trajets bougent entre deux pages : jamais deux fois la même carte.
      const seen = new Set(results.value.map(card => card.id))
      const fresh = body.content.filter(card => !seen.has(card.id))
      results.value = [...results.value, ...fresh]
      loadedPage.value = next
      // Une page qui n'apporte rien met fin à la liste, sans quoi le bouton resterait.
      total.value = fresh.length === 0 ? results.value.length : body.totalElements
      loadingMore.value = false
      return fresh.length
    } catch {
      return failMore(isStale)
    }
  }

  function failMore(isStale: () => boolean): number {
    if (!isStale()) {
      moreError.value = true
      loadingMore.value = false
    }
    return 0
  }

  function settle(isStale: () => boolean, next: SearchStatus) {
    if (isStale()) return
    results.value = []
    total.value = 0
    totalPages.value = 0
    pageSize.value = 0
    status.value = next
  }

  return { status, results, total, remaining, loadingMore, moreError, run, more }
}
