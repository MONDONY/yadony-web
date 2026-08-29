<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { contactEmail } from '@/lib/site'

const { t } = useI18n()
const p = useLocalePath()
</script>

<template>
  <footer class="border-t border-line bg-sand">
    <UiContainer>
      <div class="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p class="font-display text-lg font-bold">yadony</p>
          <p class="mt-3 max-w-prose text-sm text-ink-muted">{{ t('footer.pitch') }}</p>
        </div>
        <nav :aria-label="t('footer.navLabel')" class="text-sm">
          <NuxtLink :to="p('/comment-ca-marche')" class="block py-1 text-ink-muted hover:text-ink">{{ t('nav.howItWorks') }}</NuxtLink>
          <NuxtLink :to="p('/tarifs')" class="block py-1 text-ink-muted hover:text-ink">{{ t('nav.pricing') }}</NuxtLink>
          <NuxtLink :to="p('/securite')" class="block py-1 text-ink-muted hover:text-ink">{{ t('nav.trust') }}</NuxtLink>
          <NuxtLink :to="p('/contact')" class="block py-1 text-ink-muted hover:text-ink">{{ t('nav.contact') }}</NuxtLink>
        </nav>
        <nav :aria-label="t('footer.legalLabel')" class="text-sm">
          <NuxtLink :to="p('/mentions-legales')" class="block py-1 text-ink-muted hover:text-ink">{{ t('footer.legalNotice') }}</NuxtLink>
          <NuxtLink :to="p('/cgu')" class="block py-1 text-ink-muted hover:text-ink">{{ t('footer.terms') }}</NuxtLink>
          <NuxtLink :to="p('/confidentialite')" class="block py-1 text-ink-muted hover:text-ink">{{ t('footer.privacy') }}</NuxtLink>
          <a :href="`mailto:${contactEmail}`" class="block py-1 text-ink-muted hover:text-ink">{{ contactEmail }}</a>
        </nav>
      </div>
      <p class="border-t border-line py-6 text-xs text-ink-muted">{{ t('footer.copyright') }}</p>
    </UiContainer>
  </footer>
</template>
