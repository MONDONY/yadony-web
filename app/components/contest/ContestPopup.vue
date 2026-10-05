<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import donnees from '@/data/classement.json'
import { CONTEST_POPUP_KEY, compteARebours, doitAfficherPopup } from '@/lib/classement/popup'
import { localeDates, statutPeriode } from '@/lib/classement/score'

const { t, tm, rt, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

// <dialog> natif : focus piégé, Échap et inertie du reste de la page gérés.
const dialog = ref<HTMLDialogElement | null>(null)
const visible = ref(false)
const ouverte = ref(false)
const maintenant = ref(new Date())
let minuteur: ReturnType<typeof setInterval> | undefined
let ouverture: ReturnType<typeof setTimeout> | undefined

const statut = computed(() => statutPeriode(donnees.debut, donnees.fin, maintenant.value))
const reste = computed(() =>
  compteARebours(statut.value === 'bientot' ? donnees.debut : donnees.fin, maintenant.value),
)
const atouts = computed(() => (tm('contest.popup.perks') as unknown[]).map(p => rt(p as never)))
const icones = ['🐞', '📦', '🏆']
const dateDebut = computed(() =>
  new Intl.DateTimeFormat(localeDates(locale.value), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(donnees.debut)),
)

function lireStockage(): string | null {
  try {
    return window.localStorage.getItem(CONTEST_POPUP_KEY)
  } catch {
    return null
  }
}

function memoriserFermeture() {
  try {
    window.localStorage.setItem(CONTEST_POPUP_KEY, '1')
  } catch {
    // Sans stockage, la fenêtre reviendra à la prochaine visite : acceptable.
  }
}

async function ouvrir() {
  visible.value = true
  await nextTick()
  dialog.value?.showModal()
  // Deux images : laisse le navigateur peindre l'état fermé avant d'animer.
  requestAnimationFrame(() => requestAnimationFrame(() => (ouverte.value = true)))
}

function fermer() {
  memoriserFermeture()
  ouverte.value = false
  window.setTimeout(() => {
    dialog.value?.close()
    visible.value = false
  }, 220)
}

function surAnnulation(event: Event) {
  // Échap : on garde l'animation de sortie au lieu de la fermeture sèche.
  event.preventDefault()
  fermer()
}

function surClic(event: MouseEvent) {
  if (event.target === dialog.value) fermer()
}

onMounted(() => {
  maintenant.value = new Date()
  const afficher = doitAfficherPopup({
    chemin: route.path,
    stocke: lireStockage(),
    maintenant: maintenant.value,
    debut: donnees.debut,
    fin: donnees.fin,
  })
  if (!afficher) return
  ouverture = setTimeout(ouvrir, 1000)
  minuteur = setInterval(() => (maintenant.value = new Date()), 30_000)
})

onBeforeUnmount(() => {
  clearTimeout(ouverture)
  clearInterval(minuteur)
})

const deux = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <dialog
    v-if="visible"
    ref="dialog"
    aria-labelledby="concours-titre"
    aria-describedby="concours-texte"
    class="contest-popup m-auto w-[min(440px,calc(100%-2rem))] overflow-visible bg-transparent p-0 backdrop:bg-navy-deep/55 backdrop:backdrop-blur-[6px] max-sm:mb-0 max-sm:w-full max-sm:max-w-none"
    :class="{ 'is-open': ouverte }"
    @cancel="surAnnulation"
    @click="surClic"
  >
    <div class="popup-card overflow-hidden rounded-[28px] bg-surface text-ink shadow-[0_0_0_1px_rgb(10_20_48/0.06),0_2px_4px_rgb(10_20_48/0.08),0_24px_64px_-12px_rgb(10_20_48/0.45)] max-sm:rounded-b-none max-sm:pb-[env(safe-area-inset-bottom,0px)]">
      <div
        class="relative overflow-hidden px-6 pb-5 pt-6 text-white"
        :style="{
          backgroundImage:
            'radial-gradient(420px 220px at 80% -10%, rgb(246 146 30 / 0.35), transparent 65%),' +
            'linear-gradient(160deg, rgb(10 20 48), rgb(24 43 92))',
        }"
      >
        <div class="confetti pointer-events-none absolute inset-0" aria-hidden="true">
          <i style="left: 58%; top: 18%; background: rgb(246 146 30)" />
          <i style="left: 72%; top: 52%; background: rgb(80 220 150)" />
          <i style="left: 86%; top: 26%; background: rgb(255 255 255)" />
          <i style="left: 66%; top: 78%; background: rgb(246 146 30); width: 5px; height: 5px" />
          <i style="left: 92%; top: 68%; background: rgb(120 170 255)" />
          <i style="left: 48%; top: 40%; background: rgb(255 255 255); width: 4px; height: 4px" />
        </div>

        <button
          type="button"
          class="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-[background-color,transform] duration-150 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange active:scale-[0.96]"
          :aria-label="t('contest.popup.close')"
          @click="fermer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <div class="step s1 grid h-16 w-16 place-items-center rounded-[20px] bg-white/10 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path d="M10 5h14v7a7 7 0 0 1-14 0V5Z" fill="rgb(246 146 30)" />
            <path d="M10 7H6a4 4 0 0 0 4 5M24 7h4a4 4 0 0 1-4 5" stroke="rgb(246 146 30)" stroke-width="2.2" stroke-linecap="round" />
            <path d="M17 19v5M12 29h10M13.5 24h7v5h-7z" stroke="rgb(255 255 255)" stroke-width="2.2" stroke-linejoin="round" />
            <path d="M15 9.5l1.2 1.8 2.1.3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2.1-.3z" fill="rgb(255 255 255)" />
          </svg>
        </div>
        <p class="step s2 mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-orange">
          <span class="h-2 w-2 rounded-full" :class="statut === 'bientot' ? 'bg-orange' : 'bg-[rgb(80_220_150)] shadow-[0_0_0_4px_rgb(80_220_150/0.2)]'" aria-hidden="true" />
          {{ statut === 'bientot' ? t('contest.popup.soon', { date: dateDebut }) : t('contest.popup.live') }}
        </p>
        <h2 id="concours-titre" class="step s2 mt-2 text-balance pr-8 font-display text-[27px] font-extrabold leading-[1.08] tracking-tight">
          {{ t('contest.popup.title') }}
        </h2>
      </div>

      <div class="px-6 pb-6 pt-5">
        <p id="concours-texte" class="step s3 text-pretty text-ink-muted">{{ t('contest.popup.text') }}</p>
        <ul class="step s3 mt-4 grid gap-2.5">
          <li v-for="(atout, i) in atouts" :key="i" class="flex items-center gap-3 text-sm font-semibold">
            <span class="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-sand text-base" aria-hidden="true">{{ icones[i] }}</span>
            {{ atout }}
          </li>
        </ul>

        <div class="step s4 mt-[18px] flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
          <span>{{ statut === 'bientot' ? t('contest.popup.startsIn') : t('contest.popup.endsIn') }}</span>
          <div class="flex gap-1.5">
            <span v-for="bloc in [
              { v: String(reste.jours), l: t('contest.popup.days') },
              { v: deux(reste.heures), l: t('contest.popup.hours') },
              { v: deux(reste.minutes), l: t('contest.popup.minutes') },
            ]" :key="bloc.l" class="min-w-[46px] rounded-[10px] bg-sand px-2 py-1.5 text-center font-display text-[17px] font-extrabold leading-tight tabular-nums text-ink">
              {{ bloc.v }}<small class="block font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{{ bloc.l }}</small>
            </span>
          </div>
        </div>

        <div class="step s5 mt-5 grid gap-2">
          <NuxtLink
            :to="localePath('/classement')"
            class="group flex items-center justify-center gap-2 rounded-[14px] bg-orange px-[18px] py-3.5 text-[15px] font-extrabold text-navy-deep shadow-[0_6px_18px_-6px_rgb(246_146_30/0.7)] transition-[background-color,transform] duration-150 hover:bg-orange-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange active:scale-[0.96]"
            @click="fermer"
          >
            {{ t('contest.popup.cta') }}
            <svg class="transition-transform duration-200 group-hover:translate-x-[3px]" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </NuxtLink>
          <button
            type="button"
            class="rounded-[10px] p-2.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange"
            @click="fermer"
          >
            {{ t('contest.popup.later') }}
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/* Entrée : la carte monte et s'éclaircit, puis le contenu arrive en cascade.
   Sortie plus douce (petit glissement), interrompable : uniquement des transitions. */
.contest-popup::backdrop {
  transition: opacity 0.25s ease;
  opacity: 0;
}
.contest-popup.is-open::backdrop {
  opacity: 1;
}
.popup-card {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
  transition:
    opacity 0.25s ease,
    transform 0.35s cubic-bezier(0.2, 0, 0, 1);
}
.is-open .popup-card {
  opacity: 1;
  transform: none;
}
.confetti i {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 2px;
  opacity: 0.9;
}
@media (prefers-reduced-motion: no-preference) {
  .step {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(4px);
    transition:
      opacity 0.4s ease,
      transform 0.4s cubic-bezier(0.2, 0, 0, 1),
      filter 0.4s ease;
  }
  .is-open .step {
    opacity: 1;
    transform: none;
    filter: none;
  }
  .is-open .s1 { transition-delay: 0.1s; }
  .is-open .s2 { transition-delay: 0.2s; }
  .is-open .s3 { transition-delay: 0.3s; }
  .is-open .s4 { transition-delay: 0.4s; }
  .is-open .s5 { transition-delay: 0.5s; }
  .confetti i { animation: flotte 6s ease-in-out infinite; }
  .confetti i:nth-child(2n) { animation-duration: 7.5s; animation-delay: -2s; }
  .confetti i:nth-child(3n) { animation-duration: 5s; animation-delay: -1s; }
}
@media (prefers-reduced-motion: reduce) {
  .popup-card { transition: opacity 0.2s ease; transform: none; }
}
@keyframes flotte {
  50% { transform: translateY(-8px) rotate(25deg); }
}
</style>
