<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'
import { travelerTemps, type JourneyStep } from '@/lib/journeys'

// Les sept étapes du voyageur en quatre temps. Les textes sont ceux des
// étapes ; le titre d'une étape ne s'affiche que si le temps en regroupe
// plusieurs (sinon il répéterait le titre du temps).
const props = defineProps<{ steps: JourneyStep[] }>()

const { t } = useI18n()
const { items } = useTexts()
const base = 'journeys.traveler'
const stepTexts = items<{ title: string; text: string }>(`${base}.steps`)
</script>

<template>
  <ol class="list-none space-y-6 lg:space-y-8" :aria-label="t(`${base}.listLabel`)">
    <li
      v-for="(temps, index) in travelerTemps"
      :key="temps.id"
      class="grid items-center gap-8 rounded-sheet bg-sand p-6 sm:p-10 lg:grid-cols-2 lg:gap-12"
    >
      <div>
        <p class="text-sm font-semibold">
          <span class="rounded-pill bg-ink px-3 py-1 text-white tabular-nums">{{ t('journeys.common.stepLabel', { n: index + 1 }) }}</span>
        </p>
        <h3 class="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">{{ t(`${base}.temps.${temps.id}`) }}</h3>
        <div v-for="step in temps.steps" :key="step" class="mt-4">
          <h4 v-if="temps.steps.length > 1" class="font-display text-lg font-bold text-ink">{{ stepTexts[step]?.title }}</h4>
          <p class="mt-1 text-lg text-ink-muted">{{ stepTexts[step]?.text }}</p>
        </div>
      </div>
      <JourneyVisualInView :step="props.steps[temps.visual]!" />
    </li>
  </ol>
</template>
