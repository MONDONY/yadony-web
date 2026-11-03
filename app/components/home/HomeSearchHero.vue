<script setup lang="ts">
import { ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { hasSearch, toUrlQuery, type SearchQuery } from '@/lib/public-search'

// Haut de page : la recherche de trajets d'abord. Le formulaire envoie vers
// la page « Envoyer un colis », qui affiche les résultats : l'accueil, lui,
// ne montre jamais de liste de voyageurs.
const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const frequentId = useId()

const query = ref<SearchQuery>({ depart: '', arrivee: '', quand: '', page: 0 })

// Trajets fréquents : des liens ordinaires vers la même recherche (HTML
// prérendu, clic droit et nouvel onglet fonctionnent). Les villes sont celles
// des corridors, écrites comme dans l'API.
const frequent = [
  { depart: 'Paris', arrivee: 'Dakar' },
  { depart: 'Paris', arrivee: 'Abidjan' },
  { depart: 'Paris', arrivee: 'Bamako' },
  { depart: 'Lyon', arrivee: 'Dakar' },
  { depart: 'Marseille', arrivee: 'Douala' },
]

function routeHref(route: { depart: string; arrivee: string }): string {
  return `${localePath('/envoyer-colis')}?${new URLSearchParams(route)}`
}

function submit(next: SearchQuery) {
  // Une recherche vide mène à la section de recherche de la page, sans critère.
  void router.push(
    hasSearch(next)
      ? { path: localePath('/envoyer-colis'), query: toUrlQuery(next) }
      : { path: localePath('/envoyer-colis'), query: {}, hash: '#recherche' },
  )
}

const chip =
  'inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border border-line bg-surface px-4 text-sm font-semibold text-ink ' +
  'transition-[color,background-color,border-color,transform] duration-micro ease-dony hover:border-primary hover:bg-primary-soft active:scale-[0.96] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
</script>

<template>
  <section class="bg-sand py-10 sm:py-16">
    <UiContainer>
      <h1 class="max-w-[17ch] text-[clamp(2.375rem,5.6vw,3.875rem)] leading-[1.05] tracking-[-0.03em] text-ink">{{ t('landing.searchHero.title') }}</h1>
      <p class="mt-4 max-w-[44ch] text-lg text-ink-muted sm:text-xl">{{ t('landing.searchHero.lead') }}</p>

      <div class="mt-8 rounded-card border border-line bg-surface p-4 shadow-sm sm:p-6">
        <SearchForm v-model="query" :filters="false" @submit="submit" />
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p :id="frequentId" class="text-sm font-semibold text-ink-muted">{{ t('landing.searchHero.frequent') }}</p>
        <ul :aria-labelledby="frequentId" class="flex list-none flex-wrap gap-2">
          <li v-for="route in frequent" :key="`${route.depart}-${route.arrivee}`">
            <NuxtLink :to="routeHref(route)" :class="chip">{{ route.depart }} → {{ route.arrivee }}</NuxtLink>
          </li>
        </ul>
      </div>
    </UiContainer>
  </section>
</template>
