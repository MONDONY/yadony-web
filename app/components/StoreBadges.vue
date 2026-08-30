<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { appStoreUrl, playStoreUrl, storesLive } from '@/lib/site'

const props = withDefaults(
  defineProps<{ size?: 'md' | 'lg'; tone?: 'light' | 'dark' }>(),
  { size: 'md', tone: 'light' },
)
const { t } = useI18n()

// Sur fond sombre, le bouton principal passe en orange et le secondaire en
// contour clair ; sur fond clair, on garde les variantes d'origine.
const primaryVariant = props.tone === 'dark' ? 'orange' : 'primary'
const secondaryVariant = props.tone === 'dark' ? 'ghost-dark' : 'ghost'

// Tant que l'app n'est pas publiée (storesLive = false), les boutons
// ouvrent une fenêtre « bientôt disponible » au lieu de liens morts.
// <dialog> natif : focus piégé, Échap et clic sur l'arrière-plan gérés.
const dialog = ref<HTMLDialogElement | null>(null)

function openComingSoon() {
  dialog.value?.showModal()
}

function close() {
  dialog.value?.close()
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <template v-if="storesLive">
      <UiButton :href="appStoreUrl" :variant="primaryVariant" :size="size">{{ t('home.hero.appStore') }}</UiButton>
      <UiButton :href="playStoreUrl" :variant="secondaryVariant" :size="size">{{ t('home.hero.playStore') }}</UiButton>
    </template>
    <template v-else>
      <UiButton :variant="primaryVariant" :size="size" @click="openComingSoon">{{ t('home.hero.appStore') }}</UiButton>
      <UiButton :variant="secondaryVariant" :size="size" @click="openComingSoon">{{ t('home.hero.playStore') }}</UiButton>

      <dialog
        ref="dialog"
        :aria-label="t('stores.comingSoon.title')"
        class="m-auto w-[min(92vw,26rem)] rounded-card bg-navy-deep p-0 text-white shadow-[0_2px_4px_rgb(10_20_48/0.3),0_24px_64px_-16px_rgb(10_20_48/0.6)] backdrop:bg-navy-deep/60 backdrop:backdrop-blur-sm"
        @click="onBackdropClick"
      >
        <div class="p-8 text-center">
          <p class="font-display text-sm font-bold uppercase tracking-[0.18em] text-orange">
            {{ t('stores.comingSoon.kicker') }}
          </p>
          <p class="mt-3 font-display text-2xl font-bold">{{ t('stores.comingSoon.title') }}</p>
          <p class="mt-3 text-sm text-white/75">{{ t('stores.comingSoon.text') }}</p>
          <UiButton variant="orange" class="mt-6" @click="close">
            {{ t('stores.comingSoon.close') }}
          </UiButton>
        </div>
      </dialog>
    </template>
  </div>
</template>
