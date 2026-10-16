<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'

defineI18nRoute({ paths: { fr: '/securite', en: '/trust-and-safety' } })

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('trust.seo.title'),
    description: t('trust.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const sections = ['identity', 'escrow', 'cap', 'tracking', 'dispute', 'data', 'limits'] as const
</script>

<template>
  <div>
    <PageHero :title="t('trust.title')" :lead="t('trust.lead')" pose="id-card" :pose-alt="t('trust.donyAlt')" />
    <UiSection tone="white">
      <UiContainer>
        <ul class="grid list-none gap-5 md:grid-cols-2">
          <UiReveal
            v-for="(key, index) in sections"
            :key="key"
            as="li"
            :delay="(index % 2) * 60"
            class="rounded-card border border-line bg-surface p-7 shadow-xs"
            :class="key === 'limits' ? 'md:col-span-2 bg-sand' : ''"
          >
            <h2 class="font-display text-xl font-bold text-ink">{{ t(`trust.sections.${key}.title`) }}</h2>
            <p class="mt-3 text-ink-muted text-pretty">{{ t(`trust.sections.${key}.text`) }}</p>
          </UiReveal>
        </ul>
      </UiContainer>
    </UiSection>

    <DownloadCta />
  </div>
</template>
