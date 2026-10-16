<script setup lang="ts">
import { ref } from 'vue'
import { useInView } from '@/composables/useInView'
import type { JourneyStep } from '@/lib/journeys'

// Visuel d'étape sur téléphone : il s'anime quand il entre à l'écran.
defineProps<{ step: JourneyStep }>()

const root = ref<HTMLElement | null>(null)
const { inView } = useInView(root, { rootMargin: '0px 0px -20% 0px' })
</script>

<template>
  <div ref="root">
    <JourneyVisual :step="step" :active="inView" />
  </div>
</template>
