<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { posterSrc, videoSrc, type Tutorial } from '@/lib/tutorials'
import type { Locale } from '@/lib/locale'

// Lecteur dans un <dialog> natif : focus piégé, reste de la page inerte.
// La balise <video> n'existe que lorsqu'un tutoriel est ouvert : aucun octet
// de vidéo n'est demandé avant le clic du visiteur. Échap, le bouton Fermer
// et le clic sur l'arrière-plan émettent `close` ; c'est le parent qui
// repasse `tutorial` à null (et rend le focus à la carte).
const props = withDefaults(
  defineProps<{
    tutorial: Tutorial | null
    /** Tutoriel proposé ensuite ; le bouton n'apparaît que s'il existe. */
    next?: Tutorial | null
  }>(),
  { next: null },
)
const emit = defineEmits<{ close: []; next: [id: string] }>()

const { t, locale } = useI18n()
const dialog = ref<HTMLDialogElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const nextButton = ref<HTMLButtonElement | null>(null)
const shown = ref(false)
let frame = 0

watch(
  () => props.tutorial,
  async (current) => {
    const el = dialog.value
    if (!el) return
    if (!current) {
      cancelAnimationFrame(frame)
      shown.value = false
      if (el.open) el.close()
      return
    }
    await nextTick()
    if (!el.open) el.showModal()
    // Deux images : laisse le navigateur peindre l'état fermé avant le fondu.
    frame = requestAnimationFrame(() => requestAnimationFrame(() => (shown.value = true)))
    // Le clic du visiteur a ouvert le lecteur : on lance la lecture.
    try {
      await video.value?.play?.()
    } catch {
      // Lecture refusée : les commandes natives restent disponibles.
    }
  },
)

// À la dernière vidéo de la liste, « Vidéo suivante » disparaît : s'il avait
// le focus, il tomberait sur <body>. Le watcher tourne avant la mise à jour du
// DOM pour voir le bouton encore présent ; le focus passe à Fermer ensuite.
watch(
  () => props.next,
  async (now, before) => {
    if (now || !before || document.activeElement !== nextButton.value) return
    await nextTick()
    closeButton.value?.focus()
  },
  { flush: 'pre' },
)

onBeforeUnmount(() => cancelAnimationFrame(frame))

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('close')
}

// La fenêtre « bientôt disponible » de StoreBadges est un <dialog> imbriqué :
// son Échap remonte jusqu'ici. On ne le traite (et on ne l'annule) que s'il
// vient du lecteur lui-même ; sinon le navigateur ferme la petite fenêtre seule.
function onEscape(event: KeyboardEvent) {
  if ((event.target as Element | null)?.closest('dialog') !== dialog.value) return
  event.preventDefault()
  emit('close')
}

// Fermeture par un autre moyen que le parent (ex. bouton retour Android).
function onNativeClose() {
  if (props.tutorial) emit('close')
}
</script>

<template>
  <dialog
    ref="dialog"
    :aria-label="tutorial ? t(`tutorials.items.${tutorial.id}.title`) : t('tutorials.playerLabel')"
    class="motion-fade m-auto max-h-[96dvh] w-[min(94vw,26rem)] overflow-y-auto rounded-card bg-navy-deep p-0 text-white shadow-[0_2px_4px_rgb(10_20_48/0.3),0_24px_64px_-16px_rgb(10_20_48/0.6)] transition-opacity duration-200 backdrop:bg-navy-deep/70 backdrop:backdrop-blur-sm"
    :class="shown ? 'opacity-100' : 'opacity-0'"
    @click="onBackdropClick"
    @cancel.prevent="emit('close')"
    @keydown.esc="onEscape"
    @close="onNativeClose"
  >
    <div v-if="tutorial" class="p-4 sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-display text-lg font-bold leading-snug text-balance">
            {{ t(`tutorials.items.${tutorial.id}.title`) }}
          </h2>
          <p class="mt-1 text-sm text-white/75">
            <span class="sr-only">{{ t('tutorials.pathLabel') }} : </span><TutorialPath :id="tutorial.id" />
          </p>
        </div>
        <button
          ref="closeButton"
          type="button"
          class="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-btn border border-white/30 px-4 text-sm font-semibold text-white transition-colors duration-micro hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="emit('close')"
        >
          {{ t('tutorials.close') }}
        </button>
      </div>

      <video
        ref="video"
        :key="`${tutorial.id}-${locale}`"
        :src="videoSrc(tutorial.id, locale as Locale)"
        :poster="posterSrc(tutorial.id, locale as Locale)"
        :aria-label="t(`tutorials.items.${tutorial.id}.title`)"
        width="540"
        height="960"
        controls
        playsinline
        preload="none"
        disablepictureinpicture
        controlslist="nodownload"
        class="mx-auto mt-4 block aspect-[9/16] max-h-[62dvh] w-auto max-w-full rounded-el bg-navy outline outline-1 outline-white/10"
      />

      <p class="mt-4 text-sm text-white/75">{{ t('tutorials.demoNote') }}</p>
      <div class="mt-4 flex flex-col gap-3">
        <button
          v-if="next"
          ref="nextButton"
          type="button"
          class="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-btn bg-accent-strong px-5 text-sm font-semibold text-white shadow-accent transition-colors duration-micro hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="emit('next', next.id)"
        >
          {{ t('tutorials.seeNext') }}
        </button>
        <StoreBadges tone="dark" />
      </div>
    </div>
  </dialog>
</template>
