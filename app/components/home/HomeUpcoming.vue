<script setup lang="ts">
import { computed, onMounted, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePublicSearch } from '@/composables/usePublicSearch'
import { parseSearchQuery } from '@/lib/public-search'

// Les trois prochains départs, tirés de la recherche publique. Données du
// navigateur seulement : rien n'est appelé ni rendu côté serveur, le HTML
// prérendu ne contient donc aucun voyageur. Repli silencieux : tant que la
// réponse n'est pas bonne (chargement, vide, erreur, 429), la section entière,
// titre compris, est absente.
// Sans propriétés, aucun filtre de ville ; une page de corridor passe les
// siennes.
const props = defineProps<{ from?: string; to?: string }>()

const { t } = useI18n()
const search = usePublicSearch()
const titleId = useId()
const COUNT = 3

const cards = computed(() => (search.status.value === 'ok' ? search.results.value.slice(0, COUNT) : []))

onMounted(() => {
  void search.run(parseSearchQuery({ depart: props.from, arrivee: props.to }))
})
</script>

<template>
  <section v-if="cards.length > 0" :aria-labelledby="titleId" class="bg-bg pb-4 pt-12 sm:pt-16">
    <UiContainer>
      <h2 :id="titleId" class="text-display-md text-ink">{{ t('landing.upcoming.title') }}</h2>
      <ul class="mt-6 grid list-none gap-4 md:grid-cols-3">
        <li v-for="card in cards" :key="card.id">
          <SearchResultCard :card="card" class="h-full" />
        </li>
      </ul>
    </UiContainer>
  </section>
</template>
