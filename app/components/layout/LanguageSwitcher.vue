<script setup lang="ts">
import type { Locale } from '@/lib/locale'

defineProps<{ href: string; targetLocale: Locale; label: string }>()
</script>

<template>
  <a
    :href="href"
    :hreflang="targetLocale"
    :aria-label="label"
    class="rounded-el border border-line px-3 py-1.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:bg-sand hover:text-ink"
  >{{ targetLocale.toUpperCase() }}</a>
</template>
