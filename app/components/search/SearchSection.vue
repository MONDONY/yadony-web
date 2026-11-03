<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { usePublicSearch } from '@/composables/usePublicSearch'
import { emptyStateTitle, hasSearch, parseSearchQuery, toUrlQuery, type SearchQuery } from '@/lib/public-search'

// Recherche anonyme de trajets. La requête vit dans l'adresse : chaque envoi du
// formulaire change l'adresse sans recharger la page, et Précédent/Suivant du
// navigateur rejouent la recherche correspondante. Tout ce qui vient de
// l'adresse passe par `parseSearchQuery` avant d'être affiché ou envoyé.
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const search = usePublicSearch()
const titleId = useId()
const root = ref<HTMLElement | null>(null)

// Le HTML prérendu est celui de l'adresse nue. Tant que la page n'est pas
// montée, la requête reste donc vide : le formulaire hydraté correspond au HTML
// du serveur, et il reprend les valeurs de l'adresse juste après.
const ready = ref(false)
// La page ne vient jamais de l'adresse : une adresse partagée repart des
// premiers résultats, la suite se charge avec « Voir les autres ».
const query = computed<SearchQuery>(() => ({ ...parseSearchQuery(ready.value ? route.query : {}), page: 0 }))
const key = computed(() => JSON.stringify(toUrlQuery(query.value)))

// Une recherche est affichée : adresse avec critères, ou envoi d'un formulaire
// vide (« tous les trajets »), qui laisse l'adresse nue.
const active = ref(false)
let everything = false
let fromAddress = false

useHead(() => ({
  meta: hasSearch(query.value) ? [{ name: 'robots', content: 'noindex, follow' }] : [],
}))

function launch() {
  active.value = true
  void search.run(query.value)
}

function scrollToSection() {
  void nextTick(() => root.value?.scrollIntoView({ block: 'start' }))
}

onMounted(() => {
  fromAddress = hasSearch(parseSearchQuery(route.query))
  ready.value = true
})

watch(key, () => {
  if (hasSearch(query.value) || everything) {
    launch()
    if (fromAddress) scrollToSection()
  } else {
    active.value = false
  }
  everything = false
  fromAddress = false
})

function submit(next: SearchQuery) {
  const target = toUrlQuery(next)
  if (JSON.stringify(target) === key.value) {
    launch()
    return
  }
  everything = !hasSearch(next)
  void router.push({ query: target })
}

function widen() {
  submit(parseSearchQuery({ ...toUrlQuery(query.value), quand: '3-mois' }))
}

// « Voir les autres » : la suite s'ajoute à la liste, et le focus passe à la
// première carte ajoutée pour que le clavier continue de là (le bouton, lui,
// disparaît quand tout est affiché).
const list = ref<HTMLElement | null>(null)
const moreButton = ref<ComponentPublicInstance | null>(null)

async function loadMore() {
  const before = search.results.value.length
  const added = await search.more()
  if (added === 0) {
    // Le bouton était désactivé pendant le chargement et a perdu le focus : en
    // cas d'échec, le clavier y revient pour réessayer.
    if (search.moreError.value) {
      await nextTick()
      ;(moreButton.value?.$el as HTMLElement | undefined)?.focus()
    }
    return
  }
  await say(t('search.more.loaded', { count: added }, added))
  ;(list.value?.children[before] as HTMLElement | undefined)?.focus()
}

const routeText = computed(() => [query.value.depart, query.value.arrivee].filter(Boolean).join(' → '))
const title = computed(() => {
  const count = search.total.value
  return routeText.value
    ? t('search.results.title', { count, route: routeText.value }, count)
    : t('search.results.titleAny', { count }, count)
})
const showResults = computed(() => active.value && search.status.value === 'ok')

// Une seule région vocale, toujours présente : son texte change, elle n'est
// jamais insérée avec son contenu (les lecteurs d'écran l'annonceraient mal).
// Un texte identique au précédent n'est pas relu : on vide la région, on laisse
// le DOM se mettre à jour, puis on écrit.
const announce = ref('')

async function say(text: string) {
  announce.value = ''
  await nextTick()
  announce.value = text
}

watch(() => search.status.value, (status) => {
  if (status === 'loading') void say(t('search.states.loading'))
  else if (status === 'ok') void say(title.value)
  else if (status === 'empty') void say(emptyStateTitle(query.value, t))
  else if (status === 'rate-limited') void say(t('search.states.rateLimited.title'))
  else announce.value = ''
})
</script>

<template>
  <section id="recherche" ref="root" :aria-labelledby="titleId" class="scroll-mt-20 bg-bg py-12 sm:py-16">
    <p role="status" class="sr-only">{{ announce }}</p>
    <UiContainer>
      <h2 :id="titleId" class="text-display-md text-ink">{{ t('search.section.title') }}</h2>
      <p class="mt-3 max-w-prose text-lg text-ink-muted">{{ t('search.section.lead') }}</p>
      <div class="mt-8 rounded-card border border-line bg-surface p-4 sm:p-6">
        <SearchForm :model-value="query" @submit="submit" />
      </div>

      <div v-if="active" class="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-14">
        <div>
          <SearchStates :status="search.status.value" :query="query" @retry="launch" @widen="widen" />

          <template v-if="showResults">
            <h3 class="text-display-md text-ink">{{ title }}</h3>
            <ul ref="list" class="mt-6 grid list-none gap-4">
              <li
                v-for="card in search.results.value"
                :key="card.id"
                tabindex="-1"
                class="rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <SearchResultCard :card="card" />
              </li>
            </ul>
            <div v-if="search.remaining.value > 0" class="mt-6 grid gap-3">
              <!-- Les deux libellés occupent la même cellule : le bouton garde la
                   largeur du plus long, sans saut quand « Chargement… » prend la place. -->
              <UiButton
                ref="moreButton"
                variant="ghost"
                :disabled="search.loadingMore.value"
                :aria-busy="search.loadingMore.value ? 'true' : 'false'"
                class="w-full whitespace-nowrap disabled:cursor-wait disabled:opacity-70 disabled:active:scale-100 sm:w-auto sm:justify-self-start"
                @click="loadMore"
              >
                <span class="grid justify-items-center">
                  <span class="col-start-1 row-start-1" :class="{ invisible: search.loadingMore.value }">{{ t('search.more.button', { n: search.remaining.value }, search.remaining.value) }}</span>
                  <span class="col-start-1 row-start-1" :class="{ invisible: !search.loadingMore.value }">{{ t('search.more.loading') }}</span>
                </span>
              </UiButton>
              <p v-if="search.moreError.value" role="alert" class="text-sm font-semibold text-accent-text">{{ t('search.more.error') }}</p>
            </div>
            <!-- Seules les cinq premières pages sont atteignables : le titre garde
                 le vrai total, cette ligne explique pourquoi la liste s'arrête. -->
            <p v-else-if="search.capped.value" class="mt-6 text-ink-muted">{{ t('search.more.refine') }}</p>
          </template>
        </div>
        <aside class="rounded-card border border-line bg-surface p-6">
          <h3 class="font-display text-2xl font-bold text-ink">{{ t('search.handoff.title') }}</h3>
          <p class="mt-3 text-ink-muted">{{ t('search.results.appLead') }}</p>
          <div class="mt-5">
            <StoreBadges />
          </div>
        </aside>
      </div>
    </UiContainer>
  </section>
</template>
