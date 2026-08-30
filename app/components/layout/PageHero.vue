<script setup lang="ts">
// Bandeau d'en-tête commun aux pages intérieures : fond navy dégradé,
// même vocabulaire visuel que le hero de l'accueil.
defineProps<{
  title: string
  lead?: string
}>()
</script>

<template>
  <section
    class="bg-navy-deep text-white"
    :style="{
      backgroundImage:
        'radial-gradient(900px 420px at 85% -20%, rgb(246 146 30 / 0.16), transparent 60%),' +
        'linear-gradient(165deg, rgb(10 20 48) 0%, rgb(20 36 78) 100%)',
    }"
  >
    <UiContainer>
      <div class="py-16 sm:py-20">
        <h1 class="max-w-[22ch] text-display-xl">{{ title }}</h1>
        <p v-if="lead" class="mt-6 max-w-prose text-lg text-white/75">{{ lead }}</p>
      </div>
    </UiContainer>
  </section>
</template>
