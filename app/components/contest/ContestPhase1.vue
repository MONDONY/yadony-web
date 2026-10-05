<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { classerPhase1, phase1Visible, type TesteurPhase1 } from '@/lib/classement/phase1'
import { localeDates } from '@/lib/classement/score'
import ContestPodium from './ContestPodium.vue'

const props = defineProps<{
  donnees: {
    miseAJour: string
    fige: boolean
    debut: string
    fin: string
    revelation: string
    testeurs: TesteurPhase1[]
  }
  /** Heure du visiteur, `null` tant que la page n'est pas montée (rendu serveur). */
  maintenant: Date | null
}>()
const { t, n, locale } = useI18n()

const visible = computed(() =>
  phase1Visible(props.donnees.revelation, props.maintenant, props.donnees.testeurs.length),
)
const lignes = computed(() => (visible.value ? classerPhase1(props.donnees.testeurs) : []))

// Le top 10 tient sur un écran de téléphone ; le reste se déplie sur demande.
const LIMITE = 10
const tout = ref(false)
const lignesAffichees = computed(() => (tout.value ? lignes.value : lignes.value.slice(0, LIMITE)))
const podium = computed(() =>
  lignes.value.slice(0, 3).map((l, i) => ({
    id: `phase1-${i}`,
    nom: l.nom ?? t('contest.phase1.anonymous'),
    total: l.score,
    rang: l.rang,
    sousTitre: t('contest.phase1.podiumSub', { minutes: n(Math.round(l.minutes)), bugs: l.bugs }),
  })),
)

function date(iso: string, avecHeure: boolean): string {
  return new Intl.DateTimeFormat(localeDates(locale.value), {
    day: 'numeric',
    month: 'short',
    ...(avecHeure ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Europe/Paris',
  }).format(new Date(iso))
}

const nombre = (valeur: number) => n(valeur, { maximumFractionDigits: 1 })
</script>

<template>
  <section class="mt-12" aria-labelledby="phase1-title" data-testid="contest-phase1">
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <p class="font-display text-xs font-bold uppercase tracking-[0.18em] text-orange-deep">{{ t('contest.phase1.eyebrow') }}</p>
        <h2 id="phase1-title" class="mt-1.5 text-balance font-display text-display-md font-extrabold">
          {{ t('contest.phase1.title', { debut: date(donnees.debut, false), fin: date(donnees.fin, true) }) }}
        </h2>
        <p class="mt-1.5 max-w-prose text-ink-muted">{{ t('contest.phase1.lead') }}</p>
      </div>
      <span
        v-if="visible"
        data-testid="phase1-status"
        class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold"
        :class="donnees.fige ? 'bg-sand-deep text-ink' : 'bg-orange/15 text-orange-deep'"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="donnees.fige ? 'bg-ink-muted' : 'bg-orange'" aria-hidden="true" />
        {{ donnees.fige ? t('contest.phase1.final') : t('contest.phase1.provisional', { date: date(donnees.miseAJour, true) }) }}
      </span>
    </div>

    <p
      v-if="!visible"
      data-testid="phase1-teaser"
      class="mt-4 rounded-card border border-dashed border-line bg-surface p-6 text-ink-muted"
    >
      {{ t('contest.phase1.teaser', { date: date(donnees.revelation, true) }) }}
    </p>

    <ContestPodium v-if="visible" :lignes="podium" :chevauche="false" />

    <div v-if="visible" class="mt-6 overflow-x-auto rounded-card border border-line bg-surface">
      <table class="w-full border-collapse tabular-nums">
        <thead>
          <tr class="text-left font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            <th scope="col" class="border-b border-line px-3.5 pb-2.5 pt-3.5">{{ t('contest.board.rank') }}</th>
            <th scope="col" class="border-b border-line px-3.5 pb-2.5 pt-3.5">{{ t('contest.board.name') }}</th>
            <th scope="col" class="border-b border-line px-3.5 pb-2.5 pt-3.5 text-right">{{ t('contest.board.score') }}</th>
            <th scope="col" class="hidden border-b border-line px-3.5 pb-2.5 pt-3.5 text-right sm:table-cell">{{ t('contest.phase1.minutes') }}</th>
            <th scope="col" class="hidden border-b border-line px-3.5 pb-2.5 pt-3.5 text-right sm:table-cell">{{ t('contest.phase1.screens') }}</th>
            <th scope="col" class="hidden border-b border-line px-3.5 pb-2.5 pt-3.5 text-right sm:table-cell">{{ t('contest.phase1.bugs') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in lignesAffichees" :key="i" data-testid="phase1-row" class="transition-colors hover:bg-sand/60">
            <td class="w-12 border-b border-line px-3.5 py-2.5 font-display font-extrabold" :class="l.rang <= 3 ? 'text-orange-deep' : 'text-ink-muted'">{{ l.rang }}</td>
            <td class="border-b border-line px-3.5 py-2.5">
              <span class="block font-semibold" :class="l.nom ? '' : 'font-normal italic text-ink-muted'">{{ l.nom ?? t('contest.phase1.anonymous') }}</span>
              <span data-testid="phase1-meta" class="mt-0.5 block text-[12px] text-ink-muted sm:hidden">
                {{ t('contest.phase1.meta', { minutes: n(Math.round(l.minutes)), ecrans: n(l.ecrans), bugs: l.bugs }) }}
              </span>
            </td>
            <td class="border-b border-line px-3.5 py-2.5 text-right font-display font-extrabold">{{ nombre(l.score) }}</td>
            <td class="hidden border-b border-line px-3.5 py-2.5 text-right text-ink-muted sm:table-cell">{{ nombre(l.minutes) }}</td>
            <td class="hidden border-b border-line px-3.5 py-2.5 text-right text-ink-muted sm:table-cell">{{ n(l.ecrans) }}</td>
            <td class="hidden border-b border-line px-3.5 py-2.5 text-right sm:table-cell">{{ l.bugs }}</td>
          </tr>
        </tbody>
      </table>
      <button
        v-if="lignes.length > LIMITE"
        type="button"
        data-testid="phase1-more"
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
