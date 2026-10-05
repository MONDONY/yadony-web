<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { TOTAL_TESTS } from '@/lib/classement/bareme'
import { localeDates, type LigneClassement, type LigneDetail } from '@/lib/classement/score'
import { premiersDe, type Premiers } from '@/lib/classement/premiers'

const props = withDefaults(
  defineProps<{ lignes: LigneClassement[]; miseAJour: string | null; premiers?: Premiers }>(),
  { premiers: () => ({}) },
)

function nbPremiers(id: string): number {
  return premiersDe(id, props.premiers).length
}

function estPremier(id: string, cle: string): boolean {
  return props.premiers[cle as keyof Premiers]?.id === id
}
const { t, n, locale } = useI18n()

const ouverte = ref<string | null>(null)

// Le top 10 tient sur un écran de téléphone ; le reste se déplie sur demande.
const LIMITE = 10
const tout = ref(false)
const lignesAffichees = computed(() => (tout.value ? props.lignes : props.lignes.slice(0, LIMITE)))

function basculer(id: string) {
  ouverte.value = ouverte.value === id ? null : id
}

function libelle(ligne: LigneDetail): string {
  if (ligne.nombre !== undefined) return t(`contest.detail.${ligne.cle}`, ligne.nombre)
  return t(`contest.tests.${ligne.cle}`)
}

function duree(minutes: number): string {
  const total = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0
  return `${Math.floor(total / 60)} h ${String(total % 60).padStart(2, '0')}`
}

function dateMiseAJour(iso: string): string {
  return new Intl.DateTimeFormat(localeDates(locale.value), {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(iso))
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
            <th scope="col" class="hidden border-b border-line px-3.5 pb-2.5 pt-3.5 text-right sm:table-cell">{{ t('contest.board.tests') }}</th>
            <th scope="col" class="hidden border-b border-line px-3.5 pb-2.5 pt-3.5 text-right sm:table-cell">{{ t('contest.board.feedback') }}</th>
            <th scope="col" class="hidden border-b border-line px-3.5 pb-2.5 pt-3.5 text-right sm:table-cell" :title="t('contest.board.activityHint')">{{ t('contest.board.activity') }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="l in lignesAffichees" :key="l.id">
            <tr data-testid="board-row" class="transition-colors hover:bg-sand/60">
              <td data-testid="board-rank" class="w-12 border-b border-line px-3.5 py-3 font-display text-base font-extrabold" :class="l.rang <= 3 ? 'text-orange-deep' : 'text-ink-muted'">{{ l.rang }}</td>
              <td class="border-b border-line px-1.5 py-1.5">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-el px-2 py-1.5 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange"
                  :aria-expanded="ouverte === l.id ? 'true' : 'false'"
                  :aria-controls="ouverte === l.id ? `detail-${l.id}` : undefined"
                  @click="basculer(l.id)"
                >
                  <svg class="h-4 w-4 flex-none text-ink-muted transition-transform duration-200" :class="ouverte === l.id ? 'rotate-90' : ''" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span class="min-w-0">
                    <span class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      {{ l.nom }}
                      <span
                        v-if="nbPremiers(l.id)"
                        data-testid="premier-badge"
                        class="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-orange/15 px-2 py-0.5 text-[11.5px] font-bold text-orange-deep"
                        :title="t('contest.firsts.badgeHint', nbPremiers(l.id))"
                      ><span aria-hidden="true">🥇</span>{{ t('contest.firsts.badge', { n: nbPremiers(l.id) }) }}</span>
                    </span>
                    <span data-testid="board-meta" class="mt-0.5 block text-[12px] font-normal tabular-nums text-ink-muted sm:hidden">
                      {{ t('contest.board.meta', { tests: l.nbTests, total: TOTAL_TESTS }) }}
                    </span>
                  </span>
                </button>
              </td>
              <td class="border-b border-line px-3.5 py-3 text-right font-display text-lg font-extrabold">{{ n(l.total) }}</td>
              <td class="hidden border-b border-line px-3.5 py-3 text-right sm:table-cell">
                <span class="whitespace-nowrap rounded-full bg-sand-deep px-2.5 py-0.5 text-[12.5px] font-semibold">{{ l.nbTests }} / {{ TOTAL_TESTS }}</span>
              </td>
              <td class="hidden border-b border-line px-3.5 py-3 text-right sm:table-cell">{{ l.compteurs.bugs }} · {{ l.compteurs.ecransAvecAvis }} · {{ l.compteurs.suggestions }}</td>
              <td class="hidden whitespace-nowrap border-b border-line px-3.5 py-3 text-right text-[13px] text-ink-muted sm:table-cell">{{ n(l.indicatif?.ecrans || 0) }} · {{ duree(l.indicatif?.minutes ?? 0) }}</td>
            </tr>
            <tr v-if="ouverte === l.id" :id="`detail-${l.id}`" data-testid="board-detail">
              <td colspan="6" class="border-b border-line bg-sand p-0">
                <ul class="grid gap-x-6 gap-y-1.5 px-4 pb-4 pt-3.5 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:pl-16">
                  <li v-for="d in l.detail" :key="d.cle" class="flex justify-between gap-3 border-b border-dashed border-line py-1.5 text-[13.5px]">
                    <span>
                      {{ libelle(d) }}
                      <span
                        v-if="estPremier(l.id, d.cle)"
                        data-testid="premier-chip"
                        class="ml-1 whitespace-nowrap rounded-full bg-orange/15 px-1.5 py-px text-[11px] font-bold text-orange-deep"
                      >{{ t('contest.firsts.chip') }}</span>
                    </span>
                    <b class="whitespace-nowrap tabular-nums text-success">+{{ n(d.points) }}</b>
                  </li>
                </ul>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <button
        v-if="lignes.length > LIMITE"
        type="button"
        data-testid="board-more"
        class="flex min-h-12 w-full items-center justify-center gap-2 font-display text-[14.5px] font-bold text-orange-deep transition-[background-color,scale] duration-150 hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange active:scale-[0.96]"
        :aria-expanded="tout ? 'true' : 'false'"
        @click="tout = !tout"
      >
        {{ tout ? t('contest.board.less') : t('contest.board.more', { n: lignes.length }) }}
        <svg class="h-4 w-4 transition-transform duration-200" :class="tout ? 'rotate-180' : ''" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </section>
</template>
