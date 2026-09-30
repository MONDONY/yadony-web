<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Vidéo de démonstration dans le même cadre de téléphone que UiPhoneFrame.
//
// La vidéo n'a pas de piste audio et joue en sourdine, en boucle et en ligne
// (`playsinline`) : c'est la condition pour que Safari iOS et Chrome Android
// acceptent la lecture automatique sur téléphone. Le fichier (plusieurs Mo)
// n'est attaché qu'après l'événement `load` de la page : jusque-là, le poster
// tient lieu de visuel principal et ne retarde ni l'affichage ni le LCP.
//
// Pas de lecture automatique si le visiteur a demandé moins d'animations ou
// active l'économiseur de données : le poster reste affiché et le bouton
// lance la vidéo à la demande. Au-delà de 5 s de mouvement, WCAG 2.2.2 exige
// de pouvoir l'arrêter : le bouton pause est toujours présent.
const props = defineProps<{
  src: string
  poster: string
  description: string
  playLabel: string
  pauseLabel: string
}>()

const video = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
// Vrai dès que le visiteur a mis en pause : la vidéo ne repart plus seule
// quand elle revient à l'écran.
const pausedByUser = ref(false)
let observer: IntersectionObserver | undefined

function attachSource(): HTMLVideoElement | null {
  const el = video.value
  if (!el) return null
  if (!el.getAttribute('src')) {
    el.muted = true
    el.src = props.src
  }
  return el
}

function play() {
  const el = attachSource()
  if (!el) return
  // play() peut être refusé (mode économie d'énergie iOS) : le poster reste,
  // et le bouton de lecture permet de relancer.
  Promise.resolve(el.play()).catch(() => {
    playing.value = false
  })
}

function toggle() {
  if (playing.value) {
    pausedByUser.value = true
    video.value?.pause()
  } else {
    pausedByUser.value = false
    play()
  }
}

function prefersStill(): boolean {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false
  return reduced || saveData
}

function startWhenPageLoaded() {
  if (prefersStill()) return
  if (document.readyState === 'complete') play()
  else window.addEventListener('load', play, { once: true })
}

onMounted(() => {
  startWhenPageLoaded()

  if (typeof IntersectionObserver === 'undefined' || !video.value) return
  // Hors de l'écran, la vidéo est mise en pause pour épargner batterie et
  // processeur ; elle reprend en revenant, sauf pause demandée.
  observer = new IntersectionObserver(([entry]) => {
    const el = video.value
    if (!entry || !el || !el.getAttribute('src')) return
    if (!entry.isIntersecting) el.pause()
    else if (!pausedByUser.value) play()
  })
  observer.observe(video.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('load', play)
  observer?.disconnect()
})
</script>

<template>
  <figure
    class="relative rounded-[46px] bg-navy-deep p-[10px] shadow-[0_1px_2px_rgb(10_20_48/0.2),0_12px_32px_-8px_rgb(10_20_48/0.35),0_32px_64px_-16px_rgb(10_20_48/0.3)]"
  >
    <video
      ref="video"
      :poster="poster"
      width="720"
      height="1280"
      muted
      loop
      playsinline
      preload="none"
      disablepictureinpicture
      disableremoteplayback
      aria-hidden="true"
      class="block aspect-[9/16] w-full rounded-[36px] bg-navy object-cover outline outline-1 outline-white/10"
      @play="playing = true"
      @pause="playing = false"
    />
    <figcaption class="sr-only">{{ description }}</figcaption>
    <button
      type="button"
      class="absolute right-6 top-6 grid size-10 place-items-center rounded-full bg-navy-deep/70 text-white backdrop-blur-sm transition-[background-color,transform] duration-150 ease-out hover:bg-navy-deep/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange active:scale-[0.96]"
      :aria-label="playing ? pauseLabel : playLabel"
      @click="toggle"
    >
      <svg v-if="playing" aria-hidden="true" viewBox="0 0 24 24" class="size-4" fill="currentColor">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
      <svg v-else aria-hidden="true" viewBox="0 0 24 24" class="size-4 translate-x-px" fill="currentColor">
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
      </svg>
    </button>
  </figure>
</template>
