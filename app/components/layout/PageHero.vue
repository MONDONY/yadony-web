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
  >
    <UiContainer>
      <div class="py-16 sm:py-20">
        <h1 class="max-w-[22ch] text-display-xl">{{ title }}</h1>
        <p v-if="lead" class="mt-6 max-w-prose text-lg text-white/75">{{ lead }}</p>
      </div>
    </UiContainer>
  </section>
</template>
