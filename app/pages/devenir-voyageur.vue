<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'
import { travelerControl, travelerJourney } from '@/lib/journeys'

defineI18nRoute({ paths: { fr: '/devenir-voyageur', en: '/become-a-traveler' } })

const { t } = useI18n()
const localePath = useLocalePath()
const { items } = useTexts()

// « Vous gardez la main » : le scan hors ligne et le droit de refuser, repris
// des textes existants de l'étape et de la FAQ.
const steps = items<{ title: string; text: string }>('journeys.traveler.steps')
const faq = items<{ question: string; answer: string }>('journeys.traveler.faq')
const control = [
  { title: faq[travelerControl.faq]!.question, text: faq[travelerControl.faq]!.answer },
  steps[travelerControl.step]!,
]
</script>

<template>
  <JourneyPage
    ns="traveler"
    :steps="travelerJourney"
    :hero-screens="['my-trips']"
    hero-pose="travel"
    :video="{ src: '/video/tuto-publier-trajet.mp4', poster: '/video/tuto-publier-trajet-poster.jpg' }"
  >
    <template #steps>
      <section class="bg-surface py-14 sm:py-20">
        <UiContainer>
          <TravelerTemps :steps="travelerJourney" />
        </UiContainer>
      </section>
    </template>

    <section class="bg-bg py-14 sm:py-20">
      <UiContainer>
        <h2 class="text-display-md text-ink">{{ t('journeys.traveler.control.title') }}</h2>
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          <UiReveal v-for="(card, index) in control" :key="card.title" :delay="index * 60" class="rounded-sheet border border-line bg-surface p-6 sm:p-8">
            <h3 class="font-display text-xl font-bold text-ink">{{ card.title }}</h3>
            <p class="mt-3 text-lg text-ink-muted">{{ card.text }}</p>
          </UiReveal>
        </div>
      </UiContainer>
    </section>

    <section class="bg-sand py-14 sm:py-20">
      <UiContainer>
        <div class="grid gap-6 lg:grid-cols-2">
          <UiReveal class="rounded-sheet bg-surface p-8 shadow-sm sm:p-10">
            <EarningsSimulator />
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
