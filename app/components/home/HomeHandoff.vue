<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'

// « Chercher ici, réserver dans l'app » : la réservation, le paiement et le
// suivi se font dans l'app. Aucun téléchargement ici (le bouton « Télécharger »
// de l'en-tête et le bas de page s'en chargent).
const { t } = useI18n()
const { items } = useTexts()
const steps = items<{ lead: string; text: string }>('landing.handoff.steps')
</script>

<template>
  <section class="bg-surface py-14 sm:py-20">
    <UiContainer>
      <div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div class="lg:col-span-7">
          <h2 class="max-w-[16ch] text-display-lg text-ink">{{ t('landing.handoff.title') }}</h2>
          <ol class="mt-8 grid list-none gap-0">
            <li v-for="(step, index) in steps" :key="step.lead" class="flex gap-4 border-t border-line py-4">
              <span class="min-w-6 font-display text-lg font-bold text-accent-text" aria-hidden="true">{{ index + 1 }}</span>
              <p class="text-lg text-ink-muted"><strong class="font-semibold text-ink">{{ step.lead }}</strong> {{ step.text }}</p>
            </li>
          </ol>
        </div>
        <div class="lg:col-span-5">
          <div class="mx-auto w-[230px] sm:w-[270px]">
            <UiPhone :screens="['my-parcels']" :alts="[t('journeys.screens.my-parcels')]" sizes="270px" />
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
