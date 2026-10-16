<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { flightsJourney } from '@/lib/journeys'
import { donyPose } from '@/lib/media'

defineI18nRoute({ paths: { fr: '/billets-avion', en: '/flight-deals' } })

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <JourneyPage ns="flights" :steps="flightsJourney" :hero-screens="['flights-found']" hero-pose="ticket">
    <section class="bg-sand py-14 sm:py-20">
      <UiContainer>
        <p class="mx-auto max-w-3xl rounded-card border border-line bg-surface p-6 text-center text-ink-muted">{{ t('journeys.flights.partnerNote') }}</p>
        <UiReveal class="mx-auto mt-10 grid max-w-4xl items-center gap-8 rounded-sheet bg-accent-soft p-8 sm:grid-cols-[auto_1fr] sm:p-10">
          <UiPicture :image="donyPose('scale')" alt="" sizes="160px" class="mx-auto w-32 sm:w-40 [&_img]:h-auto [&_img]:w-full" />
          <div>
            <h2 class="text-display-md text-ink">{{ t('journeys.flights.sellKilos.title') }}</h2>
            <p class="mt-3 text-lg text-ink-muted">{{ t('journeys.flights.sellKilos.text') }}</p>
            <UiButton :to="localePath('/devenir-voyageur')" variant="accent" class="mt-6">{{ t('journeys.flights.sellKilos.cta') }}</UiButton>
          </div>
        </UiReveal>
      </UiContainer>
    </section>
  </JourneyPage>
</template>
