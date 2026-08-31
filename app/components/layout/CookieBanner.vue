<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const localePath = useLocalePath()
const { consent, hydrated, hydrate, choose } = useCookieConsent()

onMounted(hydrate)
</script>

<template>
  <div
    v-if="hydrated && consent === null"
    role="region"
    :aria-label="t('cookies.banner.label')"
    class="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-card bg-navy-deep p-6 text-white shadow-[0_2px_4px_rgb(10_20_48/0.3),0_16px_48px_-12px_rgb(10_20_48/0.55)]"
  >
    <p class="font-display font-semibold">{{ t('cookies.banner.title') }}</p>
    <p class="mt-2 text-sm text-white/75">
      {{ t('cookies.banner.text') }}
      <NuxtLink :to="localePath('/cookies')" class="underline underline-offset-2 hover:text-white">
        {{ t('cookies.banner.link') }}
      </NuxtLink>
    </p>
    <div class="mt-5 flex flex-wrap gap-3">
      <UiButton variant="orange" @click="choose('accepted')">{{ t('cookies.banner.accept') }}</UiButton>
      <UiButton variant="ghost-dark" @click="choose('refused')">{{ t('cookies.banner.refuse') }}</UiButton>
    </div>
  </div>
</template>
