<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{ size?: 'md' | 'lg' }>(), { size: 'md' })
const { t } = useI18n()

const APP_STORE_URL = 'https://apps.apple.com/app/yadony/id0000000000'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.dony.app'
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <UiButton :href="APP_STORE_URL" :size="size">{{ t('home.hero.appStore') }}</UiButton>
    <UiButton :href="PLAY_STORE_URL" variant="ghost" :size="size">{{ t('home.hero.playStore') }}</UiButton>
  </div>
</template>
