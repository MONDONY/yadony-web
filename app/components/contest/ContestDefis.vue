<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DEFI_POINTS, defiAffiche, etatDefi, type Defi } from '@/lib/classement/defis'
import { compteARebours } from '@/lib/classement/popup'
import { localeDates } from '@/lib/classement/score'

const props = defineProps<{
  defis: Defi[]
  maintenant: Date
  /** Noms affichés des testeurs, par id, pour annoncer le gagnant. */
  noms: Record<string, string>
}>()
const { t, locale } = useI18n()

const defi = computed(() => defiAffiche(props.defis, props.maintenant))
const etat = computed(() => (defi.value ? etatDefi(defi.value, props.maintenant) : 'a_venir'))
const passes = computed(() =>
  props.defis.filter(d => d !== defi.value && etatDefi(d, props.maintenant) === 'termine').reverse(),
)

function jour(iso: string): string {
  return new Intl.DateTimeFormat(localeDates(locale.value), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(new Date(iso))
}
function heure(iso: string): string {
  const h = new Intl.DateTimeFormat(localeDates(locale.value), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Paris' }).format(new Date(iso))
  return locale.value === 'en' ? h : h.replace(':', ' h ')
}
function duree(iso: string): string {
  const { jours, heures, minutes } = compteARebours(iso, props.maintenant)
  const h = jours * 24 + heures
  return h > 0 ? t('contest.defis.duration', { h, m: minutes }) : t('contest.defis.durationMin', { m: minutes })
}
function enonce(d: Defi): string | null {
  return d.enonce ? (locale.value === 'en' ? d.enonce.en : d.enonce.fr) : null
}
function gagnant(d: Defi): string | null {
  return d.gagnant ? (props.noms[d.gagnant] ?? null) : null
}
</script>

<template>
  <section
    v-if="defi"
    data-testid="defis"
    :data-etat="etat"
    class="relative -mt-16 overflow-hidden rounded-card border border-orange/40 bg-surface p-6 shadow-[0_1px_2px_rgb(10_20_48/0.06),0_12px_32px_-16px_rgb(10_20_48/0.25)] sm:p-8"
    aria-labelledby="defis-title"
  >
    <div class="flex flex-wrap items-center gap-3">
      <span class="inline-flex items-center rounded-full bg-orange px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.16em] text-navy-deep">{{ t('contest.defis.eyebrow') }}</span>
      <span class="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-muted">
        <span class="h-2 w-2 rounded-full" :class="etat === 'en_cours' ? 'bg-[rgb(40_180_110)] motion-safe:animate-pulse' : etat === 'termine' ? 'bg-ink-muted' : 'bg-orange'" aria-hidden="true" />
        {{ t(`contest.defis.state.${etat}`) }}
      </span>
    </div>
    <h2 id="defis-title" class="mt-3 text-balance font-display text-display-md font-extrabold">{{ t('contest.defis.title') }}</h2>
    <p class="mt-2 max-w-prose text-pretty text-ink-muted">{{ t('contest.defis.lead') }}</p>

    <div class="mt-5 grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <div class="rounded-el bg-sand p-5">
        <p class="font-display text-sm font-bold uppercase tracking-[0.12em] text-orange-deep">{{ t('contest.defis.rewardTitle') }}</p>
        <p class="mt-2 text-pretty">{{ t('contest.defis.reward', { min: DEFI_POINTS.min, max: DEFI_POINTS.max }) }}</p>
        <p class="mt-3 text-pretty text-[13.5px] text-ink-muted" data-testid="defis-regle">{{ t('contest.defis.rule') }}</p>
      </div>

      <div class="rounded-el border border-line p-5" data-testid="defi-courant">
        <p class="font-display text-lg font-extrabold">{{ t('contest.defis.current', { n: defi.numero, jour: jour(defi.debut) }) }}</p>
        <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14.5px]">
          <dt class="text-ink-muted">{{ t('contest.defis.launch') }}</dt>
          <dd class="font-semibold tabular-nums">{{ t('contest.defis.launchAt', { heure: heure(defi.debut) }) }}</dd>
          <dt class="text-ink-muted">{{ t('contest.defis.end') }}</dt>
          <dd class="font-semibold tabular-nums">{{ t('contest.defis.endAt', { heure: heure(defi.fin) }) }}</dd>
        </dl>

        <div v-if="etat === 'a_venir'" class="mt-4">
          <p class="font-display text-2xl font-extrabold tabular-nums text-orange-deep" data-testid="defi-compte">{{ t('contest.defis.startsIn', { temps: duree(defi.debut) }) }}</p>
          <p class="mt-1 text-pretty text-ink-muted">{{ t('contest.defis.ready', { heure: heure(defi.debut) }) }}</p>
        </div>

        <div v-else-if="etat === 'en_cours'" class="mt-4">
          <template v-if="enonce(defi)">
            <p class="font-display text-sm font-bold uppercase tracking-[0.12em] text-orange-deep">{{ t('contest.defis.statement') }}</p>
            <p class="mt-1.5 text-pretty text-lg font-semibold" data-testid="defi-enonce">{{ enonce(defi) }}</p>
            <p v-if="defi.points" class="mt-2 inline-flex rounded-full bg-orange/15 px-3 py-1 text-[13px] font-bold text-orange-deep">{{ t('contest.defis.atStake', { points: defi.points }) }}</p>
          </template>
          <p v-else class="text-pretty font-semibold">{{ t('contest.defis.pending') }}</p>
          <p class="mt-3 font-display text-xl font-extrabold tabular-nums text-orange-deep" data-testid="defi-compte">{{ t('contest.defis.endsIn', { temps: duree(defi.fin) }) }}</p>
        </div>

        <div v-else class="mt-4" data-testid="defi-resultat">
          <p v-if="enonce(defi)" class="text-pretty text-ink-muted">{{ enonce(defi) }}</p>
          <template v-if="gagnant(defi)">
            <p class="mt-2 font-display text-xl font-extrabold">{{ t('contest.defis.wonBy', { nom: gagnant(defi) }) }}</p>
            <p v-if="defi.points" class="mt-1 font-semibold text-success">{{ t('contest.defis.wonPts', { points: defi.points }) }}</p>
          </template>
          <p v-else class="mt-2 text-pretty font-semibold">{{ t('contest.defis.nobody') }}</p>
        </div>
      </div>
    </div>

    <div v-if="passes.length" class="mt-5" data-testid="defis-historique">
      <p class="font-display text-sm font-bold uppercase tracking-[0.12em] text-ink-muted">{{ t('contest.defis.history') }}</p>
      <ul class="mt-2 divide-y divide-line">
        <li v-for="d in passes" :key="d.numero" class="flex flex-wrap items-baseline justify-between gap-x-4 py-2 text-[14.5px]">
          <span class="font-semibold">{{ t('contest.defis.current', { n: d.numero, jour: jour(d.debut) }) }}</span>
          <span v-if="gagnant(d)" class="text-ink-muted">{{ t('contest.defis.wonBy', { nom: gagnant(d) }) }}<template v-if="d.points"> · +{{ d.points }}</template></span>
          <span v-else class="text-ink-muted">{{ t('contest.defis.nobody') }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
