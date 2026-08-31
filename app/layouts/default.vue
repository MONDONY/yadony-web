<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const head = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
}))
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#contenu" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-el focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
      {{ t('a11y.skipToContent') }}
    </a>
    <SiteHeader />
    <main id="contenu" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <ClientOnly>
      <CookieBanner />
    </ClientOnly>
  </div>
</template>
