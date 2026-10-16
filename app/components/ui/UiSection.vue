<script setup lang="ts">
const props = withDefaults(
  defineProps<{ tone?: 'white' | 'sand' | 'navy' | 'navy-deep' }>(),
  { tone: 'white' },
)

const tones = {
  white: 'border-t border-line bg-surface',
  sand: 'border-t border-line bg-sand',
  navy: 'bg-navy text-white',
  'navy-deep': 'bg-navy-deep text-white',
} as const

const classes = tones[props.tone]
</script>

<template>
  <section class="py-14 sm:py-20" :class="classes">
    <slot />
  </section>
</template>
