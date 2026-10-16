<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCycle } from '@/composables/useCycle'
import { useTexts } from '@/composables/useTexts'
import { donyPose, type AppScreenId } from '@/lib/media'

// Haut de page : une seule promesse, trois usages. Le téléphone fait défiler
// un écran par usage (billets, kilos, colis) et la pastille correspondante
// s'allume. Le visiteur peut choisir une pastille : la rotation s'arrête
// alors (WCAG 2.2.2, contenu qui défile seul).
const { t } = useI18n()
const { list } = useTexts()
const screens: AppScreenId[] = ['flights-found', 'my-trips', 'my-parcels']
const { index, pause, resume, select } = useCycle(screens.length, 3400)
let chosen = false

function choose(next: number) {
  chosen = true
  pause()
  select(next)
}

function resumeIfAuto() {
  if (!chosen) resume()
}
</script>

<template>
  <section class="relative overflow-hidden bg-sand">
    <div class="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-primary-soft" aria-hidden="true" />
    <div class="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-accent-soft" aria-hidden="true" />
    <UiContainer>
      <div class="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div class="lg:col-span-7">
          <p class="inline-flex items-center gap-2 rounded-pill bg-surface px-3.5 py-1.5 text-sm font-semibold text-accent-text shadow-xs">
            <span class="size-2 rounded-full bg-accent" aria-hidden="true" />
            {{ t('landing.hero.kicker') }}
          </p>
          <h1 class="mt-6 max-w-[14ch] text-display-xl text-ink">{{ t('landing.hero.title') }}</h1>
          <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('landing.hero.lead') }}</p>

          <ul class="mt-7 flex list-none flex-wrap gap-2">
            <li v-for="(chip, chipIndex) in list('landing.hero.chips')" :key="chip">
              <button
                type="button"
                class="min-h-11 rounded-pill px-4 text-sm font-semibold transition-[background-color,color,box-shadow] duration-base ease-dony"
                :class="index === chipIndex ? 'bg-primary text-white shadow-brand' : 'bg-surface text-ink shadow-xs hover:bg-primary-soft'"
                :aria-pressed="index === chipIndex"
                @click="choose(chipIndex)"
              >{{ chip }}</button>
            </li>
          </ul>

          <StoreBadges size="lg" class="mt-9" />
          <p class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
            <a href="#en-une-minute" class="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-primary-hover">
              <span class="grid size-8 place-items-center rounded-full bg-primary text-white" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="size-3.5 translate-x-px" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
              </span>
              {{ t('landing.hero.videoCta') }}
            </a>
            <span>{{ t('landing.hero.note') }}</span>
          </p>
        </div>

        <div class="lg:col-span-5">
          <div
            class="relative mx-auto w-[250px] sm:w-[290px] lg:w-[310px]"
            @mouseenter="pause"
            @mouseleave="resumeIfAuto"
            @focusin="pause"
            @focusout="resumeIfAuto"
          >
            <UiPhone :screens="screens" :alts="list('landing.hero.screensAlt')" :active="index" eager sizes="(min-width: 1024px) 310px, 290px" />
            <UiPicture
              :image="donyPose('hello')"
              :alt="t('landing.hero.donyAlt')"
              sizes="160px"
              class="animate-float absolute -bottom-6 -left-20 w-32 sm:-left-28 sm:w-40 [&_img]:h-auto [&_img]:w-full"
            />
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
