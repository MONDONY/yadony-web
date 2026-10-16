<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useTexts } from '@/composables/useTexts'
import { buildSeoMeta } from '@/lib/seo'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/structured-data'
import { donyPose, type AppScreenId, type DonyPoseId } from '@/lib/media'
import type { JourneyStep } from '@/lib/journeys'

// Gabarit des pages parcours (expéditeur, voyageur, billets) : haut de page
// avec fil d'Ariane, étapes racontées, contenus propres à la page (slot),
// tutoriel vidéo, FAQ, appel à télécharger. Métadonnées SEO, FAQPage et
// BreadcrumbList posées ici, une seule fois.
const props = defineProps<{
  ns: 'sender' | 'traveler' | 'flights'
  steps: JourneyStep[]
  heroScreens: AppScreenId[]
  heroPose: DonyPoseId
  video?: { src: string; poster: string }
}>()

const { t, locale } = useI18n()
const { items } = useTexts()
const route = useRoute()
const localePath = useLocalePath()
const base = `journeys.${props.ns}`
// Carte de partage propre à chaque parcours (générée par `pnpm og`).
const ogImages = { sender: '/og/expediteur.jpg', traveler: '/og/voyageur.jpg', flights: '/og/billets.jpg' } as const

const stepTexts = items<{ title: string; text: string }>(`${base}.steps`)
const faq = items<{ question: string; answer: string }>(`${base}.faq`)
const heroAlts = props.heroScreens.map(id => t(`journeys.screens.${id}`))

useSeoMeta(
  buildSeoMeta({
    title: t(`${base}.seo.title`),
    description: t(`${base}.seo.description`),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
    image: ogImages[props.ns],
  }),
)

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(faqJsonLd(faq)) },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbJsonLd([
        { name: t('journeys.common.home'), path: localePath('/') },
        { name: t(`${base}.kicker`), path: route.path },
      ])),
    },
  ],
})

const stepLabel = (n: number) => t('journeys.common.stepLabel', { n })
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-sand">
      <div class="pointer-events-none absolute -right-48 -top-48 size-[620px] rounded-full bg-primary-soft" aria-hidden="true" />
      <UiContainer>
        <div class="relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-12 lg:py-20">
          <div class="lg:col-span-7">
            <nav :aria-label="t('journeys.common.breadcrumb')" class="text-sm text-ink-muted">
              <ol class="flex list-none items-center gap-2">
                <li><NuxtLink :to="localePath('/')" class="hover:text-ink">{{ t('journeys.common.home') }}</NuxtLink></li>
                <li aria-hidden="true">›</li>
                <li aria-current="page" class="font-semibold text-ink">{{ t(`${base}.kicker`) }}</li>
              </ol>
            </nav>
            <h1 class="mt-6 max-w-[18ch] text-display-xl text-ink">{{ t(`${base}.title`) }}</h1>
            <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t(`${base}.lead`) }}</p>
            <StoreBadges size="lg" class="mt-9" />
          </div>
          <div class="lg:col-span-5">
            <div class="relative mx-auto w-[240px] sm:w-[280px]">
              <UiPhone :screens="heroScreens" :alts="heroAlts" eager sizes="280px" />
              <UiPicture
                :image="donyPose(heroPose)"
                alt=""
                sizes="160px"
                class="animate-float absolute -bottom-6 -left-20 w-32 sm:-left-28 sm:w-40 [&_img]:h-auto [&_img]:w-full"
              />
            </div>
          </div>
        </div>
      </UiContainer>
    </section>

    <section class="bg-surface py-14 sm:py-20">
      <UiContainer>
        <h2 class="sr-only">{{ t(`${base}.listLabel`) }}</h2>
        <JourneyScene :steps="props.steps" :texts="stepTexts" :label="t(`${base}.listLabel`)" :step-label="stepLabel" />
      </UiContainer>
    </section>

    <slot />

    <section v-if="video" class="bg-navy-deep py-14 text-white sm:py-20">
      <UiContainer>
        <div class="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 class="text-display-md">{{ t(`${base}.video.title`) }}</h2>
            <p class="mt-4 max-w-prose text-lg text-white/75">{{ t(`${base}.video.lead`) }}</p>
          </div>
          <UiReveal variant="scale" class="mx-auto w-[240px] sm:w-[270px]">
            <UiPhoneVideo
              :src="video.src"
              :poster="video.poster"
              :description="t(`${base}.video.label`)"
              :play-label="t('journeys.common.videoPlay')"
              :pause-label="t('journeys.common.videoPause')"
              :autoplay="false"
            />
          </UiReveal>
        </div>
      </UiContainer>
    </section>

    <section class="bg-bg py-14 sm:py-20">
      <UiContainer>
        <h2 class="text-display-md text-ink">{{ t('journeys.common.faqTitle') }}</h2>
        <div class="mt-8 max-w-3xl">
          <UiAccordion :items="faq.map((item, index) => ({ id: `${ns}-faq-${index}`, ...item }))" />
        </div>
      </UiContainer>
    </section>

    <DownloadCta />
  </div>
</template>
