<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'
import { crossedJourney, type JourneyStep } from '@/lib/journeys'

// Section signature de l'accueil : Awa (voyageuse) et Moussa (expéditeur),
// huit étapes qui se croisent à la négociation.
const { t } = useI18n()
const { items } = useTexts()
const texts = items<{ title: string; text: string }>('landing.crossed.steps')
const stepLabel = (n: number) => t('journeys.common.stepLabel', { n })
const actorLabel = (actor: JourneyStep['actor']) => t(`landing.crossed.actors.${actor}`)
</script>

<template>
  <section class="bg-surface py-14 sm:py-20">
    <UiContainer>
      <div class="max-w-3xl">
        <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent-text">{{ t('landing.crossed.kicker') }}</p>
        <h2 class="mt-3 text-display-lg text-ink">{{ t('landing.crossed.title') }}</h2>
        <p class="mt-5 text-lg text-ink-muted">{{ t('landing.crossed.lead') }}</p>
      </div>
      <div class="mt-10 lg:mt-4">
        <JourneyScene
          :steps="crossedJourney"
          :texts="texts"
          :label="t('landing.crossed.listLabel')"
          :step-label="stepLabel"
          :actor-label="actorLabel"
        />
      </div>
    </UiContainer>
  </section>
</template>
