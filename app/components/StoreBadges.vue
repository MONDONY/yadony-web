<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{ size?: 'md' | 'lg'; tone?: 'light' | 'dark' }>(),
  { size: 'md', tone: 'light' },
)
const { t } = useI18n()

const APP_STORE_URL = 'https://apps.apple.com/app/yadony/id0000000000'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.dony.app'

// Sur fond sombre, le bouton principal passe en orange et le secondaire en
// contour clair ; sur fond clair, on garde les variantes d'origine.
const primaryVariant = props.tone === 'dark' ? 'orange' : 'primary'
const secondaryVariant = props.tone === 'dark' ? 'ghost-dark' : 'ghost'
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <UiButton :href="APP_STORE_URL" :variant="primaryVariant" :size="size">{{ t('home.hero.appStore') }}</UiButton>
    <UiButton :href="PLAY_STORE_URL" :variant="secondaryVariant" :size="size">{{ t('home.hero.playStore') }}</UiButton>
  </div>
</template>
