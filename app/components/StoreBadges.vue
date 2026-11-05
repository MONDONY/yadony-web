<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { appStoreUrl, playStoreUrl } from '@/lib/site'

withDefaults(defineProps<{ size?: 'md' | 'lg' }>(), { size: 'md' })
const { t, locale } = useI18n()

// Badges officiels d'Apple (SVG) et de Google (PNG, marges transparentes
// rognées), dans la langue de la page. Ils ne sont ni recolorés ni
// redessinés : les chartes des deux stores l'interdisent. Même hauteur pour
// les deux, au moins 44 px de cible tactile.
const lang = () => (locale.value === 'fr' ? 'fr' : 'en')
</script>

<template>
  <div data-store-badges class="flex flex-wrap items-center gap-3">
    <a
      :href="appStoreUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex rounded-[10px] transition-transform duration-micro ease-dony focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.96]"
    >
      <img
        :src="`/img/stores/app-store-${lang()}.svg`"
        :alt="t('home.hero.appStore')"
        width="127"
        height="40"
        :class="size === 'lg' ? 'h-14 w-auto' : 'h-12 w-auto'"
      >
    </a>
    <a
      :href="playStoreUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex rounded-[10px] transition-transform duration-micro ease-dony focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.96]"
    >
      <img
        :src="`/img/stores/google-play-${lang()}.png`"
        :alt="t('home.hero.playStore')"
        :width="lang() === 'fr' ? 646 : 564"
        :height="lang() === 'fr' ? 192 : 168"
        :class="size === 'lg' ? 'h-14 w-auto' : 'h-12 w-auto'"
      >
    </a>
  </div>
</template>
