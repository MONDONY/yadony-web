<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { corridors } from '@/lib/corridors'
import { senderJourney } from '@/lib/journeys'

defineI18nRoute({ paths: { fr: '/envoyer-colis', en: '/send-a-parcel' } })

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <JourneyPage
    ns="sender"
    :steps="senderJourney"
    :hero-screens="['parcel-tracking']"
    hero-pose="hello"
    :video="{ src: '/video/tuto-envoyer-colis.mp4', poster: '/video/tuto-envoyer-colis-poster.jpg' }"
  >
    <HomeRecipient />
    <section class="bg-surface py-14 sm:py-20">
      <UiContainer>
        <h2 class="text-display-md text-ink">{{ t('journeys.sender.corridorsTitle') }}</h2>
        <ul class="mt-8 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="corridor in corridors" :key="corridor.slug">
            <NuxtLink
              :to="localePath(`/envoyer-colis/${corridor.slug}`)"
              class="group flex h-full flex-col rounded-card border border-line bg-bg p-6 transition-[border-color,background-color] duration-micro ease-dony hover:border-primary hover:bg-primary-soft"
            >
              <span class="font-display text-xl font-bold text-ink">{{ corridor.from }} → {{ corridor.to }}</span>
              <span class="mt-2 flex-1 text-sm text-ink-muted">{{ t(`corridorPages.pages.${corridor.key}.lead`) }}</span>
              <span class="mt-4 font-semibold text-primary">{{ t('corridorPages.hub.cardCta') }} <span aria-hidden="true">→</span></span>
            </NuxtLink>
          </li>
        </ul>
      </UiContainer>
    </section>
  </JourneyPage>
</template>
