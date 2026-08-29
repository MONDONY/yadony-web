<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'white' | 'sand' }>(), { tone: 'white' })
</script>

<template>
  <section
    class="border-t border-line py-20 sm:py-28"
    :class="tone === 'sand' ? 'bg-sand' : 'bg-surface'"
  >
    <slot />
  </section>
</template>
