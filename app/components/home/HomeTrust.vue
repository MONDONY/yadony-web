<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'
import { donyPose } from '@/lib/media'

const { t } = useI18n()
const { items } = useTexts()
const localePath = useLocalePath()
const pillars = items<{ title: string; text: string }>('landing.trust.items')

// Pictogrammes (traits 2 px, style des icônes de l'app).
const icons = [
  'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21a8 8 0 0 1 16 0',
  'M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z',
  'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2M18 14h2v2M14 18h2v2M18 18v2',
  'M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z',
]
</script>

<template>
  <section class="bg-sand py-14 sm:py-20">
    <UiContainer>
      <div class="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div class="lg:col-span-4">
          <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent-text">{{ t('landing.trust.kicker') }}</p>
          <h2 class="mt-3 text-display-lg text-ink">{{ t('landing.trust.title') }}</h2>
          <p class="mt-5 text-lg text-ink-muted">{{ t('landing.trust.lead') }}</p>
          <UiButton :to="localePath('/securite')" variant="ghost" class="mt-8">{{ t('landing.trust.cta') }}</UiButton>
          <UiPicture :image="donyPose('id-card')" :alt="t('landing.trust.donyAlt')" sizes="200px" class="animate-float mt-10 hidden w-48 lg:block [&_img]:h-auto [&_img]:w-full" />
        </div>
        <ul class="grid list-none gap-5 sm:grid-cols-2 lg:col-span-8">
          <UiReveal v-for="(pillar, index) in pillars" :key="pillar.title" as="li" :delay="index * 60" class="rounded-card bg-surface p-7 shadow-sm">
            <span class="grid size-12 place-items-center rounded-btn bg-primary-soft text-primary" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons[index]" /></svg>
            </span>
            <h3 class="mt-5 font-display text-xl font-bold text-ink">{{ pillar.title }}</h3>
            <p class="mt-2 text-ink-muted">{{ pillar.text }}</p>
          </UiReveal>
        </ul>
      </div>
    </UiContainer>
  </section>
</template>
