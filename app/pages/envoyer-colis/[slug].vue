<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { findCorridor, neighbors } from '@/lib/corridors'
import { gpForCorridor } from '@/lib/gp'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/structured-data'
import { donyPose } from '@/lib/media'
import { useInView } from '@/composables/useInView'
import { useTexts } from '@/composables/useTexts'

defineI18nRoute({ paths: { fr: '/envoyer-colis/[slug]', en: '/send-a-parcel/[slug]' } })

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { items } = useTexts()

const corridor = findCorridor(route.params.slug)
if (!corridor) {
  throw createError({ statusCode: 404, statusMessage: 'Corridor inconnu', fatal: true })
}

const key = corridor.key
const others = neighbors(corridor)
const gp = locale.value === 'fr' ? gpForCorridor(corridor) : null
const faqItems = items<{ question: string; answer: string }>(`corridorPages.pages.${key}.faq`)

useSeoMeta(
  buildSeoMeta({
    title: t(`corridorPages.pages.${key}.seo.title`),
    description: t(`corridorPages.pages.${key}.seo.description`),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(faqJsonLd(faqItems)) },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbJsonLd([
        { name: t('journeys.common.home'), path: localePath('/') },
        { name: t('journeys.sender.kicker'), path: localePath('/envoyer-colis') },
        { name: `${corridor.from} → ${corridor.to}`, path: route.path },
      ])),
    },
  ],
})

const sections = [
  { titleKey: 'howTitle', textKey: 'how' },
  { titleKey: 'priceTitle', textKey: 'price' },
  { titleKey: 'delayTitle', textKey: 'delay' },
  { titleKey: 'safetyTitle', textKey: 'safety' },
] as const

const routeCard = ref<HTMLElement | null>(null)
const { inView } = useInView(routeCard, { once: true })
const faqAccordion = computed(() => faqItems.map((item, index) => ({ id: `${corridor.slug}-faq-${index}`, ...item })))
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-sand">
      <div class="pointer-events-none absolute -right-48 -top-48 size-[560px] rounded-full bg-primary-soft" aria-hidden="true" />
      <UiContainer>
        <div class="relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:py-20">
          <div class="lg:col-span-7">
            <nav :aria-label="t('journeys.common.home')" class="text-sm text-ink-muted">
              <ol class="flex list-none flex-wrap items-center gap-2">
                <li><NuxtLink :to="localePath('/')" class="hover:text-ink">{{ t('journeys.common.home') }}</NuxtLink></li>
                <li aria-hidden="true">›</li>
                <li><NuxtLink :to="localePath('/envoyer-colis')" class="hover:text-ink">{{ t('journeys.sender.kicker') }}</NuxtLink></li>
                <li aria-hidden="true">›</li>
                <li aria-current="page" class="font-semibold text-ink">{{ corridor.from }} → {{ corridor.to }}</li>
              </ol>
            </nav>
            <h1 class="mt-6 max-w-[20ch] text-display-xl text-ink">{{ t(`corridorPages.pages.${key}.title`) }}</h1>
            <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t(`corridorPages.pages.${key}.lead`) }}</p>
            <StoreBadges size="lg" class="mt-9" />
          </div>
          <div ref="routeCard" class="relative lg:col-span-5">
            <div class="rounded-sheet bg-surface p-6 shadow-lg">
              <ArtRouteLine :from="corridor.from" :to="corridor.to" :drawn="inView" />
            </div>
            <UiPicture :image="donyPose('travel')" alt="" sizes="144px" class="animate-float absolute -bottom-10 -right-2 w-28 sm:w-36 [&_img]:h-auto [&_img]:w-full" />
          </div>
        </div>
      </UiContainer>
    </section>

    <section class="bg-surface py-16 sm:py-24">
      <UiContainer>
        <div class="grid gap-12 lg:grid-cols-12">
          <ProseBlock class="lg:col-span-8">
            <template v-for="section in sections" :key="section.titleKey">
              <h2>{{ t(`corridorPages.common.${section.titleKey}`) }}</h2>
              <p>{{ t(`corridorPages.pages.${key}.${section.textKey}`) }}</p>
            </template>
          </ProseBlock>
          <aside class="flex flex-col gap-4 lg:col-span-4">
            <NuxtLink
              v-if="gp"
              :to="`/gp/${gp.slug}`"
              class="rounded-card border border-line bg-accent-soft p-6 font-semibold text-accent-text transition-colors duration-micro hover:border-accent"
            >{{ t('landing.corridors.gp') }} <span aria-hidden="true">→</span></NuxtLink>
            <NuxtLink :to="localePath('/envoyer-colis')" class="rounded-card border border-line bg-bg p-6 font-semibold text-primary hover:border-primary">{{ t('nav.howItWorks') }} <span aria-hidden="true">→</span></NuxtLink>
            <NuxtLink :to="localePath('/tarifs')" class="rounded-card border border-line bg-bg p-6 font-semibold text-primary hover:border-primary">{{ t('nav.pricing') }} <span aria-hidden="true">→</span></NuxtLink>
            <NuxtLink :to="localePath('/securite')" class="rounded-card border border-line bg-bg p-6 font-semibold text-primary hover:border-primary">{{ t('nav.trust') }} <span aria-hidden="true">→</span></NuxtLink>
          </aside>
        </div>
      </UiContainer>
    </section>

    <section class="bg-bg py-16 sm:py-24">
      <UiContainer>
        <h2 class="max-w-[24ch] text-display-md text-ink">{{ t('corridorPages.common.faqTitle') }}</h2>
        <div class="mt-8 max-w-3xl">
          <UiAccordion :items="faqAccordion" />
        </div>

        <h2 class="mt-16 font-display text-xl font-bold text-ink">{{ t('corridorPages.common.othersTitle') }}</h2>
        <ul class="mt-5 flex list-none flex-wrap gap-3">
          <li v-for="other in others" :key="other.slug">
            <NuxtLink
              :to="localePath(`/envoyer-colis/${other.slug}`)"
              class="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors duration-micro hover:border-primary hover:bg-primary-soft"
            >{{ other.from }} → {{ other.to }}</NuxtLink>
          </li>
          <li>
            <NuxtLink
              :to="localePath('/envoyer-colis')"
              class="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-5 text-sm font-semibold text-primary hover:border-primary"
            >{{ t('corridorPages.common.backToHub') }}</NuxtLink>
          </li>
        </ul>
      </UiContainer>
    </section>

    <DownloadCta />
  </div>
</template>
