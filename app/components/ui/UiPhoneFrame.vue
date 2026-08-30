<script setup lang="ts">
// Cadre de téléphone dessiné en CSS autour d'une capture d'app.
// Rayons concentriques : extérieur (46px) = intérieur (36px) + padding (10px).
defineProps<{
  src: string
  alt: string
  eager?: boolean
}>()
</script>

<template>
  <figure
    class="rounded-[46px] bg-navy-deep p-[10px] shadow-[0_1px_2px_rgb(10_20_48/0.2),0_12px_32px_-8px_rgb(10_20_48/0.35),0_32px_64px_-16px_rgb(10_20_48/0.3)]"
  >
    <img
      :src="src"
      :alt="alt"
      width="640"
      height="1385"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      decoding="async"
      class="w-full rounded-[36px] bg-sand outline outline-1 outline-white/10"
    >
  </figure>
</template>
