<script setup lang="ts">
import { computed } from 'vue'
import type { Locale } from '@/lib/locale'

const props = defineProps<{ href: string; targetLocale: Locale }>()

const label = computed(() => (props.targetLocale === 'en' ? 'English' : 'Français'))
</script>

<template>
  <a
    :href="href"
    :hreflang="targetLocale"
    :aria-label="`Lire cette page en ${label}`"
    class="rounded-el border border-line px-3 py-1.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:bg-sand hover:text-ink"
  >{{ targetLocale.toUpperCase() }}</a>
</template>
