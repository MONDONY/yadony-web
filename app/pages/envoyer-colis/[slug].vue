<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { corridors, findCorridor } from '@/lib/corridors'
import { faqJsonLd } from '@/lib/structured-data'

defineI18nRoute({ paths: { fr: '/envoyer-colis/[slug]', en: '/send-a-parcel/[slug]' } })

const { t, tm, rt, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const corridor = findCorridor(route.params.slug)
if (!corridor) {
  throw createError({ statusCode: 404, statusMessage: 'Corridor inconnu', fatal: true })
}

const key = corridor.key
const others = corridors.filter(entry => entry.slug !== corridor.slug)

useSeoMeta(
  buildSeoMeta({
    title: t(`corridorPages.pages.${key}.seo.title`),
    description: t(`corridorPages.pages.${key}.seo.description`),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const faqItems = computed(() =>
  (tm(`corridorPages.pages.${key}.faq`) as unknown[]).map((raw) => {
    const entry = raw as { question: unknown; answer: unknown }
    return { question: rt(entry.question as never), answer: rt(entry.answer as never) }
  }),
)

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(faqJsonLd(faqItems.value)) },
  ],
})

const sections = [
  { titleKey: 'howTitle', textKey: 'how' },
  { titleKey: 'priceTitle', textKey: 'price' },
  { titleKey: 'delayTitle', textKey: 'delay' },
  { titleKey: 'safetyTitle', textKey: 'safety' },
] as const
</script>

<template>
  <div>
    <PageHero
      :title="t(`corridorPages.pages.${key}.title`)"
      :lead="t(`corridorPages.pages.${key}.lead`)"
    />

    <UiSection tone="white">
      <UiContainer>
        <ProseBlock>
          <template v-for="section in sections" :key="section.titleKey">
            <h2>{{ t(`corridorPages.common.${section.titleKey}`) }}</h2>
            <p>{{ t(`corridorPages.pages.${key}.${section.textKey}`) }}</p>
          </template>
        </ProseBlock>

        <p class="mt-10 max-w-prose text-ink-muted">
          <NuxtLink :to="localePath('/tarifs')" class="font-semibold text-primary underline underline-offset-2">
            {{ t('nav.pricing') }}
          </NuxtLink>
          ·
          <NuxtLink :to="localePath('/comment-ca-marche')" class="font-semibold text-primary underline underline-offset-2">
            {{ t('nav.howItWorks') }}
          </NuxtLink>
          ·
          <NuxtLink :to="localePath('/securite')" class="font-semibold text-primary underline underline-offset-2">
            {{ t('nav.trust') }}
          </NuxtLink>
        </p>
      </UiContainer>
    </UiSection>

    <UiSection tone="sand">
      <UiContainer>
        <h2 class="max-w-[24ch] text-display-md">{{ t('corridorPages.common.faqTitle') }}</h2>
        <div class="mt-8 max-w-3xl">
          <UiAccordion
            :items="faqItems.map((item, index) => ({ id: `${corridor.slug}-faq-${index}`, ...item }))"
          />
        </div>

        <h3 class="mt-14 font-display text-lg font-semibold">{{ t('corridorPages.common.othersTitle') }}</h3>
        <ul class="mt-4 flex list-none flex-wrap gap-3">
          <li v-for="other in others" :key="other.slug">
            <NuxtLink
              :to="localePath(`/envoyer-colis/${other.slug}`)"
              class="inline-block rounded-el border border-line bg-surface px-4 py-2 text-sm font-semibold transition-colors duration-150 hover:bg-sand-deep"
            >{{ other.from }} → {{ other.to }}</NuxtLink>
          </li>
          <li>
            <NuxtLink
              :to="localePath('/envoyer-colis')"
              class="inline-block rounded-el border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-sand-deep"
            >{{ t('corridorPages.common.backToHub') }}</NuxtLink>
          </li>
        </ul>
      </UiContainer>
    </UiSection>

    <DownloadCta />
  </div>
</template>
