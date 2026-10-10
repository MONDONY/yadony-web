<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DEFI_POINTS, DEFI_POINTS_BUG, defiAffiche, etatDefi, gagnantsDefi, type Defi } from '@/lib/classement/defis'
import { compteARebours } from '@/lib/classement/popup'
import { localeDates } from '@/lib/classement/score'
import ContestDefiBilan from './ContestDefiBilan.vue'

const props = withDefaults(
  defineProps<{
    defis: Defi[]
    maintenant: Date
    /** Noms affichés des testeurs, par id, pour annoncer le gagnant. */
    noms: Record<string, string>
    /** « bandeau » : une ligne en haut de page qui mène à la section ; « complet » : la section. */
    variante?: 'bandeau' | 'complet'
  }>(),
  { variante: 'complet' },
)
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
function jourCourt(iso: string): string {
  return new Intl.DateTimeFormat(localeDates(locale.value), { weekday: 'long', timeZone: 'Europe/Paris' }).format(new Date(iso))
}
/** Défi du soir : « ce soir à 19 h 30 » ; défi de journée : « dimanche à 10 h 00 ». */
function annonce(d: Defi): string {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Paris' }).format(new Date(d.debut)))
  return h >= 17
    ? t('contest.defis.banner.a_venir', { n: d.numero, heure: heure(d.debut) })
    : t('contest.defis.banner.a_venirJour', { n: d.numero, jour: jourCourt(d.debut), heure: heure(d.debut) })
}
/** Points en jeu : un montant, ou ceux de chaque place pour un défi à podium. */
function enjeu(d: Defi): string | null {
  if (d.podium?.length) return d.podium.join(' / ')
  return d.points ? String(d.points) : null
}
function rang(i: number): string {
  if (locale.value === 'en') return ['1st', '2nd', '3rd'][i] ?? `${i + 1}th`
  return i === 0 ? '1er' : `${i + 1}e`
}
function podium(d: Defi): { rang: string; nom: string; points: number }[] {
  return gagnantsDefi(d).map((id, i) => ({ rang: rang(i), nom: props.noms[id] ?? id, points: d.podium?.[i] ?? 0 }))
}
function enonce(d: Defi): string | null {
  return d.enonce ? (locale.value === 'en' ? d.enonce.en : d.enonce.fr) : null
}
function aDetail(d: Defi): boolean {
  return Boolean(d.reussites?.length || d.partiels?.length || d.bilan?.length)
}
function gagnant(d: Defi): string | null {
  const noms = gagnantsDefi(d).map(id => props.noms[id]).filter((n): n is string => Boolean(n))
  if (!noms.length) return null
  return new Intl.ListFormat(localeDates(locale.value), { style: 'long', type: 'conjunction' }).format(noms)
}
const pastille = computed(() =>
  etat.value === 'en_cours' ? 'bg-[rgb(40_180_110)] motion-safe:animate-pulse' : etat.value === 'termine' ? 'bg-ink-muted' : 'bg-orange',
)
</script>

<template>
  <!-- Bandeau : une ligne, pour garder le classement sur le premier écran du téléphone. -->
  <a
    v-if="defi && variante === 'bandeau'"
    href="#defis"
    data-testid="defis-bandeau"
    :data-etat="etat"
    class="relative -mt-16 flex items-center gap-3 rounded-card border border-orange/40 bg-surface px-4 py-3 shadow-[0_1px_2px_rgb(10_20_48/0.06),0_12px_32px_-16px_rgb(10_20_48/0.25)] transition-[scale] duration-150 active:scale-[0.98] sm:px-5"
  >
    <span class="grid h-10 w-10 flex-none place-items-center rounded-full bg-orange font-display text-lg font-extrabold text-navy-deep" aria-hidden="true">{{ defi.numero }}</span>
    <span class="min-w-0 flex-1">
      <span class="flex items-center gap-2 font-display text-[15px] font-extrabold leading-tight">
        <span class="h-2 w-2 flex-none rounded-full" :class="pastille" aria-hidden="true" />
        <span class="truncate">{{ etat === 'a_venir' ? annonce(defi) : t(`contest.defis.banner.${etat}`, { n: defi.numero, heure: heure(defi.debut) }) }}</span>
      </span>
      <span class="mt-0.5 block truncate text-[13px] tabular-nums text-ink-muted">
        <template v-if="etat === 'a_venir'">{{ t('contest.defis.startsIn', { temps: duree(defi.debut) }) }}<span class="hidden sm:inline"> · {{ defi.podium?.length ? t('contest.defis.atStake', { points: enjeu(defi) }) : t('contest.defis.rewardChip', DEFI_POINTS) }}</span></template>
        <template v-else-if="etat === 'en_cours'">{{ t('contest.defis.endsIn', { temps: duree(defi.fin) }) }}<template v-if="enjeu(defi)"> · {{ t('contest.defis.atStake', { points: enjeu(defi) }) }}</template></template>
        <template v-else>{{ gagnant(defi) ? t('contest.defis.wonBy', { nom: gagnant(defi) }) : t('contest.defis.nobodyShort') }}</template>
      </span>
    </span>
    <span class="flex-none text-[13px] font-bold text-orange-deep"><span class="sr-only sm:not-sr-only">{{ t(etat === 'en_cours' ? 'contest.defis.seeStatement' : 'contest.defis.see') }} </span><span class="text-lg sm:text-[13px]" aria-hidden="true">→</span></span>
  </a>

  <!-- Section complète, compacte. -->
  <section
    v-else-if="defi"
    id="defis"
    data-testid="defis"
    :data-etat="etat"
    class="mt-10 scroll-mt-24 rounded-card border border-orange/40 bg-surface p-5 sm:p-7"
    aria-labelledby="defis-title"
  >
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span class="rounded-full bg-orange px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-navy-deep">{{ t('contest.defis.eyebrow') }}</span>
      <span class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted"><span class="h-2 w-2 rounded-full" :class="pastille" aria-hidden="true" />{{ t(`contest.defis.state.${etat}`) }}</span>
    </div>
    <h2 id="defis-title" class="mt-2 text-balance font-display text-[24px] font-extrabold leading-tight sm:text-display-md">{{ t('contest.defis.title') }}</h2>
    <p class="mt-1 text-pretty text-[14.5px] text-ink-muted">{{ t('contest.defis.lead') }}</p>

    <div class="mt-4 rounded-el bg-sand p-4" data-testid="defi-courant">
      <p class="font-display text-[17px] font-extrabold">{{ t('contest.defis.current', { n: defi.numero, jour: jour(defi.debut) }) }}</p>
      <div class="mt-2 flex flex-wrap gap-2 text-[13px] font-semibold tabular-nums">
        <span class="rounded-full bg-surface px-3 py-1">{{ t('contest.defis.chipStart', { heure: heure(defi.debut) }) }}</span>
        <span class="rounded-full bg-surface px-3 py-1">{{ t('contest.defis.chipEnd', { heure: heure(defi.fin) }) }}</span>
      </div>

      <div v-if="etat === 'a_venir'" class="mt-3">
        <p class="font-display text-[22px] font-extrabold tabular-nums text-orange-deep" data-testid="defi-compte">{{ t('contest.defis.startsIn', { temps: duree(defi.debut) }) }}</p>
        <p class="text-pretty text-[14px] text-ink-muted">{{ t('contest.defis.ready', { heure: heure(defi.debut) }) }}</p>
        <p v-if="defi.podium?.length" class="mt-2 inline-flex rounded-full bg-orange/15 px-3 py-1 text-[13px] font-bold text-orange-deep">{{ t('contest.defis.atStake', { points: enjeu(defi) }) }}</p>
      </div>

      <div v-else-if="etat === 'en_cours'" class="mt-3">
        <template v-if="enonce(defi)">
          <p class="whitespace-pre-line text-pretty text-[16px] font-semibold leading-relaxed" data-testid="defi-enonce">{{ enonce(defi) }}</p>
          <p v-if="enjeu(defi)" class="mt-2 inline-flex rounded-full bg-orange/15 px-3 py-1 text-[13px] font-bold text-orange-deep">{{ t('contest.defis.atStake', { points: enjeu(defi) }) }}</p>
        </template>
        <p v-else class="text-pretty font-semibold">{{ t('contest.defis.pending') }}</p>
        <p class="mt-2 font-display text-[20px] font-extrabold tabular-nums text-orange-deep" data-testid="defi-compte">{{ t('contest.defis.endsIn', { temps: duree(defi.fin) }) }}</p>
      </div>

      <div v-else class="mt-3" data-testid="defi-resultat">
        <p v-if="enonce(defi)" class="whitespace-pre-line text-pretty text-[14px] text-ink-muted">{{ enonce(defi) }}</p>
        <ol v-if="defi.podium?.length && gagnant(defi)" class="mt-1 grid gap-1 font-display text-[17px] font-extrabold tabular-nums" data-testid="defi-podium">
          <li v-for="p in podium(defi)" :key="p.rang">{{ t('contest.defis.place', p) }}</li>
        </ol>
        <template v-else-if="gagnant(defi)">
          <p class="mt-1 font-display text-[20px] font-extrabold">{{ t('contest.defis.wonBy', { nom: gagnant(defi) }) }}</p>
          <p v-if="defi.points" class="font-semibold text-success">{{ t(gagnantsDefi(defi).length > 1 ? 'contest.defis.wonPtsEach' : 'contest.defis.wonPts', { points: defi.points }) }}</p>
        </template>
        <p v-else class="mt-1 text-pretty font-semibold">{{ t('contest.defis.nobody') }}</p>
        <ContestDefiBilan :defi="defi" />
      </div>
    </div>

    <p class="mt-3 text-pretty text-[13px] leading-relaxed text-ink-muted" data-testid="defis-regle">
      <b class="block text-ink">{{ t('contest.defis.rewardChip', DEFI_POINTS) }}</b>{{ t('contest.defis.rule') }}
    </p>
    <p class="mt-2 text-pretty text-[13px] leading-relaxed text-ink-muted" data-testid="defis-bugs">
      {{ t('contest.defis.bugRule', { n: DEFI_POINTS_BUG }) }}
    </p>

    <div v-if="passes.length" class="mt-4" data-testid="defis-historique">
      <p class="font-display text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">{{ t('contest.defis.history') }}</p>
      <ul class="mt-1 divide-y divide-line">
        <li v-for="d in passes" :key="d.numero" class="py-2 text-[14px]">
          <div class="flex flex-wrap items-baseline justify-between gap-x-4">
            <span class="font-semibold">{{ t('contest.defis.current', { n: d.numero, jour: jour(d.debut) }) }}</span>
            <span v-if="gagnant(d)" class="text-ink-muted">{{ t('contest.defis.wonBy', { nom: gagnant(d) }) }}<template v-if="enjeu(d)"> · +{{ enjeu(d) }}</template></span>
            <span v-else class="text-ink-muted">{{ t('contest.defis.nobodyShort') }}</span>
          </div>
          <details v-if="aDetail(d)" class="mt-1">
            <summary class="cursor-pointer text-[13px] font-bold text-orange-deep">{{ t('contest.defis.seeResult') }}</summary>
            <ContestDefiBilan :defi="d" />
          </details>
        </li>
      </ul>
    </div>
  </section>
</template>
