<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Bloc voyageur de l'accueil : vendre ses kilos libres. L'appel mène à la page
// « Devenir voyageur » du site ; le téléchargement de l'app passe uniquement
// par les badges des stores.
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="bg-surface py-14 sm:py-20">
    <UiContainer>
      <div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div class="lg:col-span-5">
          <div class="mx-auto w-[230px] sm:w-[270px]">
            <UiPhone :screens="['my-trips']" :alts="[t('journeys.screens.my-trips')]" sizes="270px" />
          </div>
        </div>
        <div class="lg:col-span-7">
          <h2 class="max-w-[16ch] text-display-lg text-ink">{{ t('landing.traveler.title') }}</h2>
          <p class="mt-4 max-w-[38ch] text-lg text-ink-muted sm:text-xl">{{ t('landing.traveler.text') }}</p>
          <UiButton :to="localePath('/devenir-voyageur')" size="lg" class="mt-7 whitespace-nowrap">{{ t('landing.traveler.cta') }}</UiButton>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
