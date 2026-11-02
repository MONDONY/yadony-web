<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { posterSrc, tutorialDuration, tutorials } from '@/lib/tutorials'
import type { Locale } from '@/lib/locale'

// Teaser d'accueil : quatre affiches (images seules, aucune vidéo dans la
// page). Un clic mène à la page Tutoriels avec le lecteur ouvert sur la vidéo.
const { t, locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value as Locale)

const featured = ['search', 'track', 'payments', 'flights']
  .map(id => tutorials.find(item => item.id === id)!)
</script>

<template>
  <section class="bg-sand py-14 sm:py-20">
    <UiContainer>
      <div class="max-w-2xl">
        <h2 class="text-display-lg text-ink text-balance">{{ t('tutorials.home.title') }}</h2>
        <p class="mt-5 text-lg text-ink-muted">{{ t('tutorials.home.lead') }}</p>
      </div>
      <ul class="mt-10 grid list-none grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <UiReveal v-for="(item, index) in featured" :key="item.id" as="li" :delay="index * 60">
          <NuxtLink
            :to="localePath({ path: '/tutoriels', query: { v: item.id } })"
            :data-home-tutorial="item.id"
            class="group flex h-full min-h-11 flex-col rounded-card bg-surface p-3 shadow-sm transition-[box-shadow,transform] duration-micro ease-dony hover:shadow-md active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span class="relative block overflow-hidden rounded-el bg-navy">
              <img
                :src="posterSrc(item.id, lang)"
                alt=""
                width="540"
                height="960"
                loading="lazy"
                decoding="async"
                class="block aspect-[9/16] h-auto w-full object-cover"
              >
              <span class="absolute inset-0 flex items-center justify-center bg-navy-deep/25" aria-hidden="true">
                <span class="flex size-12 items-center justify-center rounded-full bg-white/95 text-navy-deep shadow-sm transition-transform duration-micro ease-dony group-hover:scale-105">
                  <svg viewBox="0 0 24 24" class="ml-0.5 size-5" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
                </span>
              </span>
            </span>
            <span class="mt-3 block px-1 pb-1">
              <span class="block font-display text-base font-bold leading-snug text-navy-deep text-balance">
                {{ t(`tutorials.items.${item.id}.title`) }}
              </span>
              <span class="mt-1 block text-sm font-semibold tabular-nums text-ink-muted">{{ tutorialDuration(item, lang) }}</span>
            </span>
          </NuxtLink>
        </UiReveal>
      </ul>
      <UiButton :to="localePath('/tutoriels')" variant="ghost" class="mt-8">{{ t('tutorials.all') }}</UiButton>
    </UiContainer>
  </section>
</template>
