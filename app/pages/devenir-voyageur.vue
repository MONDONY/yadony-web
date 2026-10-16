<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { travelerJourney } from '@/lib/journeys'

defineI18nRoute({ paths: { fr: '/devenir-voyageur', en: '/become-a-traveler' } })

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <JourneyPage
    ns="traveler"
    :steps="travelerJourney"
    :hero-screens="['my-trips']"
    hero-pose="travel"
    :video="{ src: '/video/tuto-publier-trajet.mp4', poster: '/video/tuto-publier-trajet-poster.jpg' }"
  >
    <section class="bg-sand py-14 sm:py-20">
      <UiContainer>
        <div class="grid gap-6 lg:grid-cols-2">
          <UiReveal class="rounded-sheet bg-surface p-8 shadow-sm sm:p-10">
            <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent-text">{{ t('journeys.traveler.earnings.kicker') }}</p>
            <h2 class="mt-3 text-display-md text-ink">{{ t('journeys.traveler.earnings.title') }}</h2>
            <p class="mt-4 text-lg text-ink-muted">{{ t('journeys.traveler.earnings.text') }}</p>
            <p class="mt-6 text-sm text-ink-muted">{{ t('journeys.traveler.earnings.note') }}</p>
          </UiReveal>
          <UiReveal :delay="60" class="rounded-sheet bg-navy p-8 text-white shadow-sm sm:p-10">
            <h2 class="text-display-md">{{ t('journeys.traveler.payouts.title') }}</h2>
            <p class="mt-4 text-lg text-white/80">{{ t('journeys.traveler.payouts.text') }}</p>
            <NuxtLink :to="localePath('/billets-avion')" class="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-accent hover:underline">
              {{ t('journeys.traveler.flightsLink') }} <span aria-hidden="true">→</span>
            </NuxtLink>
          </UiReveal>
        </div>
      </UiContainer>
    </section>
  </JourneyPage>
</template>
