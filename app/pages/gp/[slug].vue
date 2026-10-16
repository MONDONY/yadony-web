<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { findCorridor } from '@/lib/corridors'
import { findGpPage, gpPages } from '@/lib/gp'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/structured-data'
import { donyPose } from '@/lib/media'
import { useTexts } from '@/composables/useTexts'

// Pages « GP vérifié », en français seulement (le terme n'a pas d'équivalent
// anglais) : pas de version /en, donc pas d'alternate hreflang.
defineI18nRoute({ locales: ['fr'], paths: { fr: '/gp/[slug]' } })

const { t } = useI18n()
const route = useRoute()
const { items, list } = useTexts()

const page = findGpPage(route.params.slug)
if (!page) {
  throw createError({ statusCode: 404, statusMessage: 'Page GP inconnue', fatal: true })
}
const corridor = findCorridor(page.slug)!
const base = `gp.pages.${page.key}`
const steps = list(`${base}.how`)
const faq = items<{ question: string; answer: string }>(`${base}.faq`)
const comparison = items<{ label: string; usual: string; yadony: string }>('gp.common.comparison.rows')
const others = gpPages.filter(other => other.slug !== page.slug)

useSeoMeta(
  buildSeoMeta({ title: t(`${base}.seo.title`), description: t(`${base}.seo.description`), path: route.path, locale: 'fr' }),
)

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(faqJsonLd(faq)) },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbJsonLd([
        { name: t('journeys.common.home'), path: '/' },
        { name: t('gp.common.breadcrumb'), path: route.path },
      ])),
    },
  ],
})

const faqAccordion = computed(() => faq.map((item, index) => ({ id: `gp-${page.slug}-faq-${index}`, ...item })))
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-sand">
      <div class="pointer-events-none absolute -right-48 -top-48 size-[560px] rounded-full bg-accent-soft" aria-hidden="true" />
      <UiContainer>
        <div class="relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:py-20">
          <div class="lg:col-span-8">
            <nav :aria-label="t('journeys.common.home')" class="text-sm text-ink-muted">
              <ol class="flex list-none flex-wrap items-center gap-2">
                <li><NuxtLink to="/" class="hover:text-ink">{{ t('journeys.common.home') }}</NuxtLink></li>
                <li aria-hidden="true">›</li>
                <li aria-current="page" class="font-semibold text-ink">{{ t('gp.common.breadcrumb') }} · {{ page.from }} → {{ page.to }}</li>
              </ol>
            </nav>
            <h1 class="mt-6 max-w-[20ch] text-display-xl text-ink">{{ t(`${base}.title`) }}</h1>
            <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t(`${base}.lead`) }}</p>
            <StoreBadges size="lg" class="mt-9" />
          </div>
          <div class="lg:col-span-4">
            <UiPicture :image="donyPose('id-card')" alt="" sizes="240px" eager class="animate-float mx-auto w-48 sm:w-60 [&_img]:h-auto [&_img]:w-full" />
          </div>
        </div>
      </UiContainer>
    </section>

    <section class="bg-surface py-16 sm:py-24">
      <UiContainer>
        <ProseBlock>
          <h2>{{ t('gp.common.whatTitle') }}</h2>
          <p>{{ t(`${base}.what`) }}</p>
          <h2>{{ t('gp.common.risksTitle') }}</h2>
          <p>{{ t(`${base}.risks`) }}</p>
          <h2>{{ t('gp.common.yadonyTitle') }}</h2>
          <p>{{ t(`${base}.yadony`) }}</p>
          <h2>{{ t('gp.common.priceTitle') }}</h2>
          <p>{{ t(`${base}.price`) }}</p>
        </ProseBlock>
      </UiContainer>
    </section>

    <section class="bg-sand py-16 sm:py-24">
      <UiContainer>
        <h2 class="text-display-md text-ink">{{ t('gp.common.comparison.title') }}</h2>
        <div class="mt-8 overflow-x-auto rounded-card border border-line bg-surface">
          <table class="w-full min-w-[560px] text-left">
            <thead class="bg-bg text-sm">
              <tr>
                <th scope="col" class="p-4"><span class="sr-only">{{ t('gp.common.comparison.title') }}</span></th>
                <th scope="col" class="p-4 font-semibold text-ink-muted">{{ t('gp.common.comparison.columns.usual') }}</th>
                <th scope="col" class="p-4 font-semibold text-primary">{{ t('gp.common.comparison.columns.yadony') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparison" :key="row.label" class="border-t border-line align-top">
                <th scope="row" class="p-4 font-semibold text-ink">{{ row.label }}</th>
                <td class="p-4 text-ink-muted">{{ row.usual }}</td>
                <td class="p-4 font-medium text-ink">{{ row.yadony }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 class="mt-16 text-display-md text-ink">{{ t('gp.common.howTitle') }}</h2>
        <ol class="mt-8 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UiReveal v-for="(step, index) in steps" :key="step" as="li" :delay="index * 60" class="rounded-card bg-surface p-6 shadow-sm">
            <span class="grid size-10 place-items-center rounded-full bg-primary font-display font-bold text-white">{{ index + 1 }}</span>
            <p class="mt-4 text-ink">{{ step }}</p>
          </UiReveal>
        </ol>
      </UiContainer>
    </section>

    <section class="bg-bg py-16 sm:py-24">
      <UiContainer>
        <h2 class="text-display-md text-ink">{{ t('gp.common.faqTitle') }}</h2>
        <div class="mt-8 max-w-3xl">
          <UiAccordion :items="faqAccordion" />
        </div>
        <p class="mt-12">
          <NuxtLink :to="`/envoyer-colis/${corridor.slug}`" class="font-semibold text-primary underline underline-offset-4 hover:text-primary-hover">
            {{ t('gp.common.corridorLink', { from: corridor.from, to: corridor.to }) }}
          </NuxtLink>
        </p>
        <h2 class="mt-12 font-display text-xl font-bold text-ink">{{ t('gp.common.othersTitle') }}</h2>
        <ul class="mt-5 flex list-none flex-wrap gap-3">
          <li v-for="other in others" :key="other.slug">
            <NuxtLink :to="`/gp/${other.slug}`" class="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-5 text-sm font-semibold text-ink hover:border-primary hover:bg-primary-soft">GP {{ other.from }} {{ other.to }}</NuxtLink>
          </li>
        </ul>
      </UiContainer>
    </section>

    <DownloadCta />
  </div>
</template>
