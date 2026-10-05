<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { TOTAL_TESTS } from '@/lib/classement/bareme'
import type { LigneClassement, LigneDetail } from '@/lib/classement/score'

defineProps<{ lignes: LigneClassement[]; miseAJour: string | null }>()
const { t, n, locale } = useI18n()

const ouverte = ref<string | null>(null)

function basculer(id: string) {
  ouverte.value = ouverte.value === id ? null : id
}

function libelle(ligne: LigneDetail): string {
  if (ligne.nombre !== undefined) return t(`contest.detail.${ligne.cle}`, ligne.nombre)
  return t(`contest.tests.${ligne.cle}`)
}

function duree(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  return `${Math.floor(total / 60)} h ${String(total % 60).padStart(2, '0')}`
}

function dateMiseAJour(iso: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(iso))
}

// Nombre de « tests » au sens du compteur n / 26 : tests à action + avis écran + suggestion.
function testsAffiches(l: LigneClassement): number {
  return l.testsValides.length + (l.ecransAvecAvis > 0 ? 1 : 0) + (l.suggestions > 0 ? 1 : 0)
}

</script>

<template>
  <section class="mt-9" aria-labelledby="board-title">
    <div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 id="board-title" class="font-display text-[22px] font-extrabold tracking-tight">
        {{ t('contest.board.title') }}
      </h2>
      <p class="text-[13px] text-ink-muted">
        <template v-if="miseAJour">{{ t('contest.board.updated', { date: dateMiseAJour(miseAJour) }) }} · </template>{{ t('contest.board.hint') }}
      </p>
    </div>

    <div class="overflow-x-auto rounded-card border border-line bg-surface">
      <table class="w-full border-collapse tabular-nums">
        <thead>
          <tr class="text-left font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            <th scope="col" class="border-b border-line px-3.5 pb-2.5 pt-3.5">{{ t('contest.board.rank') }}</th>
            <th scope="col" class="border-b border-line px-3.5 pb-2.5 pt-3.5">{{ t('contest.board.name') }}</th>
            <th scope="col" class="border-b border-line px-3.5 pb-2.5 pt-3.5 text-right">{{ t('contest.board.score') }}</th>
            <th scope="col" class="border-b border-line px-3.5 pb-2.5 pt-3.5 text-right">{{ t('contest.board.tests') }}</th>
            <th scope="col" class="hidden border-b border-line px-3.5 pb-2.5 pt-3.5 text-right sm:table-cell">{{ t('contest.board.feedback') }}</th>
            <th scope="col" class="hidden border-b border-line px-3.5 pb-2.5 pt-3.5 text-right sm:table-cell" :title="t('contest.board.activityHint')">{{ t('contest.board.activity') }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="l in lignes" :key="l.id">
            <tr data-testid="board-row" class="transition-colors hover:bg-sand/60">
              <td data-testid="board-rank" class="w-12 border-b border-line px-3.5 py-3 font-display text-base font-extrabold" :class="l.rang <= 3 ? 'text-orange-deep' : 'text-ink-muted'">{{ l.rang }}</td>
              <td class="border-b border-line px-1.5 py-1.5">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-el px-2 py-1.5 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange"
                  :aria-expanded="ouverte === l.id ? 'true' : 'false'"
                  :aria-controls="`detail-${l.id}`"
                  @click="basculer(l.id)"
                >
                  <svg class="h-4 w-4 flex-none text-ink-muted transition-transform duration-200" :class="ouverte === l.id ? 'rotate-90' : ''" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  {{ l.nom }}
                </button>
              </td>
              <td class="border-b border-line px-3.5 py-3 text-right font-display text-lg font-extrabold">{{ n(l.total) }}</td>
              <td class="border-b border-line px-3.5 py-3 text-right">
                <span class="whitespace-nowrap rounded-full bg-sand-deep px-2.5 py-0.5 text-[12.5px] font-semibold">{{ testsAffiches(l) }} / {{ TOTAL_TESTS }}</span>
              </td>
              <td class="hidden border-b border-line px-3.5 py-3 text-right sm:table-cell">{{ l.bugs }} · {{ l.ecransAvecAvis }} · {{ l.suggestions }}</td>
              <td class="hidden whitespace-nowrap border-b border-line px-3.5 py-3 text-right text-[13px] text-ink-muted sm:table-cell">{{ n(l.indicatif.ecrans) }} · {{ duree(l.indicatif.minutes) }}</td>
            </tr>
            <tr v-if="ouverte === l.id" :id="`detail-${l.id}`" data-testid="board-detail">
              <td colspan="6" class="border-b border-line bg-sand p-0">
                <ul class="grid gap-x-6 gap-y-1.5 px-4 pb-4 pt-3.5 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:pl-16">
                  <li v-for="d in l.detail" :key="d.cle" class="flex justify-between gap-3 border-b border-dashed border-line py-1.5 text-[13.5px]">
                    <span>{{ libelle(d) }}</span>
                    <b class="whitespace-nowrap tabular-nums text-success">+{{ n(d.points) }}</b>
                  </li>
                </ul>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>
