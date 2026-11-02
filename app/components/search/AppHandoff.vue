<script setup lang="ts">
import { onMounted, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'
import { formatDepartureDate, type PublicAnnouncementCard } from '@/lib/public-search'
import type { Locale } from '@/lib/locale'

// Remise à l'app : la réservation se fait uniquement dans l'app. Pas de QR
// code ici, les stores ne sont pas encore publiés : StoreBadges ouvre alors sa
// propre fenêtre « bientôt disponible », imbriquée dans celle-ci.
// <dialog> natif : focus piégé, Échap et pile des fenêtres gérés par le
// navigateur. Échap ne ferme que la fenêtre du dessus ; on n'écoute donc que
// l'événement `close` (qui ne remonte pas), jamais la touche elle-même.
const props = defineProps<{ card: PublicAnnouncementCard; open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t, locale } = useI18n()
const { list } = useTexts()
const titleId = useId()
const dialog = ref<HTMLDialogElement | null>(null)

function sync() {
  const el = dialog.value
  if (!el) return
  if (props.open && !el.open) el.showModal()
  else if (!props.open && el.open) el.close()
}

onMounted(sync)
watch(() => props.open, sync)

function close() {
  dialog.value?.close()
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}
</script>

<template>
  <dialog
    ref="dialog"
    :aria-labelledby="titleId"
    class="m-auto w-[min(92vw,30rem)] rounded-card bg-surface p-0 text-ink shadow-xl backdrop:bg-navy-deep/60 backdrop:backdrop-blur-sm"
    @click="onBackdropClick"
    @close="emit('close')"
  >
    <div class="p-6 sm:p-8">
      <h2 :id="titleId" class="font-display text-2xl font-bold text-ink">{{ t('search.handoff.title') }}</h2>
      <p class="mt-3 rounded-field bg-sand px-4 py-3 text-sm font-semibold text-ink">
        {{ t('search.handoff.trip', {
          name: card.traveler.displayName,
          from: card.departureCity,
          to: card.arrivalCity,
          date: formatDepartureDate(card.departureDate, locale as Locale),
        }) }}
      </p>
      <ol class="mt-5 grid list-none gap-3">
        <li v-for="(step, index) in list('search.handoff.steps')" :key="index" class="flex items-start gap-3">
          <span aria-hidden="true" class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">{{ index + 1 }}</span>
          <span class="pt-1 text-base text-ink">{{ step }}</span>
        </li>
      </ol>
      <div class="mt-6">
        <StoreBadges />
      </div>
      <div class="mt-6 flex justify-end">
        <UiButton variant="ghost" @click="close">{{ t('search.handoff.close') }}</UiButton>
      </div>
    </div>
  </dialog>
</template>
