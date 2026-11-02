<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { tutorials, type TutorialAudience } from '@/lib/tutorials'

defineI18nRoute({ paths: { fr: '/tutoriels', en: '/tutorials' } })

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

useSeoMeta(
  buildSeoMeta({
    title: t('tutorials.seo.title'),
    description: t('tutorials.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

// Le HTML prérendu liste les six tutoriels ; le filtre et le lecteur ne
// vivent que dans le navigateur.
type Filter = 'all' | TutorialAudience
const filters: Filter[] = ['all', 'sender', 'recipient', 'traveler']
const filter = ref<Filter>('all')
const visible = computed(() =>
  filter.value === 'all' ? tutorials : tutorials.filter(item => item.audience === filter.value),
)

const openId = ref<string | null>(null)
const current = computed(() => tutorials.find(item => item.id === openId.value) ?? null)
const next = computed(() => {
  const index = visible.value.findIndex(item => item.id === openId.value)
  return index >= 0 ? (visible.value[index + 1] ?? null) : null
})
// Carte qui a ouvert le lecteur : le focus lui revient à la fermeture, même
// après un passage par « Vidéo suivante ».
let opener: string | null = null

function open(id: string) {
  if (openId.value === null) opener = id
  openId.value = id
}

async function close() {
  const id = opener
  openId.value = null
  await nextTick()
  if (id) document.querySelector<HTMLElement>(`[data-tutorial="${id}"]`)?.focus()
}
</script>

<template>
  <div>
    <PageHero :title="t('tutorials.title')" :lead="t('tutorials.lead')" />

    <UiSection tone="white">
      <UiContainer>
        <div role="group" :aria-label="t('tutorials.filtersLabel')" class="flex flex-wrap gap-2">
          <button
            v-for="item in filters"
            :key="item"
            type="button"
            :aria-pressed="filter === item"
            class="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-btn border px-5 text-sm font-semibold transition-colors duration-micro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="filter === item ? 'border-primary bg-primary text-white' : 'border-line text-ink hover:bg-sand'"
            @click="filter = item"
          >
            {{ t(`tutorials.filters.${item}`) }}
          </button>
        </div>

        <ul class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <li v-for="item in visible" :key="item.id" data-testid="tutorial-card">
            <TutorialCard :tutorial="item" @open="open" />
          </li>
        </ul>

        <p class="mt-8 text-sm text-ink-muted">{{ t('tutorials.demoNote') }}</p>
      </UiContainer>
    </UiSection>

    <TutorialPlayer
      :tutorial="current"
      :next="next"
      :open-app-to="localePath('/ouvrir')"
      @close="close"
      @next="open"
    />
  </div>
</template>
