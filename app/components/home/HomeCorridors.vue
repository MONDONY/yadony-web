<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInView } from '@/composables/useInView'
import { corridors } from '@/lib/corridors'

// Carte France → Afrique et liens vers chaque page corridor : le maillage
// interne qui fait découvrir les pages corridors aux moteurs.
const { t } = useI18n()
const localePath = useLocalePath()
const map = ref<HTMLElement | null>(null)
const { inView } = useInView(map, { once: true })
</script>

<template>
  <section class="bg-surface py-20 sm:py-28">
    <UiContainer>
      <div class="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div class="lg:col-span-7">
          <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent-text">{{ t('landing.corridors.kicker') }}</p>
          <h2 class="mt-3 text-display-lg text-ink">{{ t('landing.corridors.title') }}</h2>
          <p class="mt-5 text-lg text-ink-muted">{{ t('landing.corridors.lead') }}</p>
          <ul class="mt-8 grid list-none gap-3 sm:grid-cols-2" :aria-label="t('landing.corridors.listLabel')">
            <li v-for="corridor in corridors" :key="corridor.slug">
              <NuxtLink
                :to="localePath(`/envoyer-colis/${corridor.slug}`)"
                class="group flex min-h-12 items-center justify-between rounded-btn border border-line bg-bg px-4 py-3 font-semibold text-ink transition-[background-color,border-color] duration-micro ease-dony hover:border-primary hover:bg-primary-soft"
              >
                <span>{{ corridor.from }} → {{ corridor.to }}</span>
                <span aria-hidden="true" class="text-primary transition-transform duration-micro ease-dony group-hover:translate-x-1">→</span>
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <UiButton :to="localePath('/envoyer-colis')">{{ t('landing.corridors.cta') }}</UiButton>
            <NuxtLink v-if="$i18n.locale === 'fr'" to="/gp/paris-dakar" class="font-semibold text-primary underline underline-offset-4 hover:text-primary-hover">{{ t('landing.corridors.gp') }}</NuxtLink>
          </div>
        </div>
        <div ref="map" class="mx-auto w-full max-w-sm lg:col-span-5">
          <ArtCorridorMap :drawn="inView" />
        </div>
      </div>
    </UiContainer>
  </section>
</template>
