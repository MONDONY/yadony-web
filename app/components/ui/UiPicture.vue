<script setup lang="ts">
import { computed } from 'vue'
import { IMAGE_WIDTHS, srcset, type SiteImage } from '@/lib/media'

// Image responsive AVIF + WebP générée par `pnpm images`. Les dimensions
// intrinsèques réservent la place avant le chargement (aucun décalage de
// mise en page) ; seule l'image du haut de page est chargée en priorité.
const props = withDefaults(
  defineProps<{ image: SiteImage; alt: string; sizes?: string; eager?: boolean }>(),
  { sizes: '(min-width: 1024px) 360px, 70vw', eager: false },
)

const largest = computed(() => {
  const widths = IMAGE_WIDTHS[props.image.kind]
  return `${props.image.base}-${widths[widths.length - 1]}.webp`
})
</script>

<template>
  <picture class="block">
    <source type="image/avif" :srcset="srcset(image.base, 'avif', image.kind)" :sizes="sizes">
    <source type="image/webp" :srcset="srcset(image.base, 'webp', image.kind)" :sizes="sizes">
    <img
      :src="largest"
      :alt="alt"
      :width="image.width"
      :height="image.height"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      decoding="async"
    >
  </picture>
</template>
