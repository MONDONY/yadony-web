<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { posterSrc, tutorialDuration, type Tutorial } from '@/lib/tutorials'
import type { Locale } from '@/lib/locale'

// Carte d'un tutoriel : seule l'affiche (une image) est chargée ; la vidéo
// n'existe pas dans la page tant que le visiteur n'a pas ouvert le lecteur.
const props = defineProps<{ tutorial: Tutorial }>()
const emit = defineEmits<{ open: [id: string] }>()

const { t, locale } = useI18n()
const lang = computed(() => locale.value as Locale)
const duration = computed(() => tutorialDuration(props.tutorial, lang.value))
</script>

<template>
  <button
    type="button"
    :data-tutorial="tutorial.id"
    aria-haspopup="dialog"
    class="group flex w-full items-stretch gap-4 rounded-card border border-line bg-surface p-3 text-left shadow-sm transition-[box-shadow,transform,border-color] duration-micro ease-dony hover:border-primary/40 hover:shadow-md active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    @click="emit('open', tutorial.id)"
  >
    <span class="relative block w-28 shrink-0 overflow-hidden rounded-el bg-navy sm:w-32">
      <img
        :src="posterSrc(tutorial.id, lang)"
        alt=""
        width="540"
        height="960"
        loading="lazy"
        decoding="async"
        class="block aspect-[9/16] h-auto w-full object-cover"
      >
      <span class="absolute inset-0 flex items-center justify-center bg-navy-deep/25" aria-hidden="true">
        <span class="flex size-11 items-center justify-center rounded-full bg-white/95 text-navy-deep shadow-sm transition-transform duration-micro ease-dony group-hover:scale-105">
          <svg viewBox="0 0 24 24" class="ml-0.5 size-5" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
        </span>
      </span>
    </span>
    <span class="flex min-w-0 flex-1 flex-col py-1">
      <span class="text-xs font-bold uppercase tracking-[0.12em] text-accent-text">
        {{ t(`tutorials.filters.${tutorial.audience}`) }}
      </span>
      <span class="mt-1.5 font-display text-lg font-bold leading-snug text-navy-deep text-balance">
        {{ t(`tutorials.items.${tutorial.id}.title`) }}
      </span>
      <span class="mt-1 text-sm font-semibold tabular-nums text-ink-muted">{{ duration }}</span>
      <span class="mt-auto pt-3 text-sm text-ink-muted">
        <span class="sr-only">{{ t('tutorials.pathLabel') }} : </span><TutorialPath :id="tutorial.id" />
      </span>
    </span>
  </button>
</template>
