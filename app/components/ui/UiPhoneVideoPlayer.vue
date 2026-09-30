<script setup lang="ts">
// Lecteur vidéo à la demande dans le cadre de téléphone de UiPhoneFrame.
//
// À l'inverse de UiPhoneVideo (hero, muette, lecture automatique), ces
// vidéos ont une voix ou une musique : elles ne démarrent qu'au geste du
// visiteur, avec les commandes natives du navigateur. `preload="none"` : rien
// n'est téléchargé avant le clic, seul le poster est chargé (en différé).
// `playsinline` garde la lecture dans la page sur iPhone au lieu de passer en
// plein écran d'office ; le bouton plein écran des commandes reste disponible.
defineProps<{
  src: string
  poster: string
  label: string
}>()
</script>

<template>
  <figure
    class="rounded-[46px] bg-navy-deep p-[10px] shadow-[0_1px_2px_rgb(10_20_48/0.2),0_12px_32px_-8px_rgb(10_20_48/0.35),0_32px_64px_-16px_rgb(10_20_48/0.3)]"
  >
    <video
      :key="src"
      :src="src"
      :poster="poster"
      :aria-label="label"
      width="720"
      height="1280"
      controls
      playsinline
      preload="none"
      disablepictureinpicture
      controlslist="nodownload noplaybackrate"
      class="block aspect-[9/16] w-full rounded-[36px] bg-navy object-cover outline outline-1 outline-white/10"
    />
  </figure>
</template>
