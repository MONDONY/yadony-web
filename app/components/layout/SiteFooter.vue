<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { contactEmail } from '@/lib/site'

const { t } = useI18n()
const p = useLocalePath()
const { reopen } = useCookieConsent()

const YADONY_PRO_URL = 'https://pro.yadony.com'
</script>

<template>
  <footer class="bg-navy-deep text-white">
    <UiContainer>
      <div class="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img
            src="/logos/logo-yadony-480.webp"
            alt="Yadony"
            width="480"
            height="131"
            loading="lazy"
            class="h-8 w-auto brightness-0 invert"
          >
          <p class="mt-4 max-w-prose text-sm text-white/65">{{ t('footer.pitch') }}</p>
          <address class="mt-5 text-sm not-italic text-white/65">
            <p class="font-semibold text-white">{{ t('footer.company.name') }}</p>
            <p>{{ t('footer.company.line1') }}</p>
            <p>{{ t('footer.company.line2') }}</p>
          </address>
        </div>

        <nav :aria-label="t('footer.navLabel')" class="text-sm">
          <p class="font-display font-semibold text-white">{{ t('footer.navTitle') }}</p>
          <NuxtLink :to="p('/envoyer-colis')" class="mt-3 block py-1 text-white/65 hover:text-white">{{ t('nav.corridors') }}</NuxtLink>
          <NuxtLink :to="p('/comment-ca-marche')" class="block py-1 text-white/65 hover:text-white">{{ t('nav.howItWorks') }}</NuxtLink>
          <NuxtLink :to="p('/tarifs')" class="block py-1 text-white/65 hover:text-white">{{ t('nav.pricing') }}</NuxtLink>
          <NuxtLink :to="p('/securite')" class="block py-1 text-white/65 hover:text-white">{{ t('nav.trust') }}</NuxtLink>
          <NuxtLink :to="p('/a-propos')" class="block py-1 text-white/65 hover:text-white">{{ t('nav.about') }}</NuxtLink>
          <NuxtLink :to="p('/contact')" class="block py-1 text-white/65 hover:text-white">{{ t('nav.contact') }}</NuxtLink>
        </nav>

        <nav :aria-label="t('footer.legalLabel')" class="text-sm">
          <p class="font-display font-semibold text-white">{{ t('footer.legalTitle') }}</p>
          <NuxtLink :to="p('/mentions-legales')" class="mt-3 block py-1 text-white/65 hover:text-white">{{ t('footer.legalNotice') }}</NuxtLink>
          <NuxtLink :to="p('/cgu')" class="block py-1 text-white/65 hover:text-white">{{ t('footer.terms') }}</NuxtLink>
          <NuxtLink :to="p('/confidentialite')" class="block py-1 text-white/65 hover:text-white">{{ t('footer.privacy') }}</NuxtLink>
          <NuxtLink :to="p('/cookies')" class="block py-1 text-white/65 hover:text-white">{{ t('footer.cookiesPolicy') }}</NuxtLink>
          <button
            type="button"
            class="block py-1 text-left text-white/65 underline underline-offset-2 hover:text-white"
            @click="reopen"
          >{{ t('footer.manageCookies') }}</button>
        </nav>

        <div class="text-sm">
          <p class="font-display font-semibold text-white">{{ t('footer.proTitle') }}</p>
          <p class="mt-3 text-white/65">{{ t('footer.proText') }}</p>
          <a
            :href="YADONY_PRO_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 inline-block font-semibold text-orange hover:text-orange-hover"
          >{{ t('footer.proCta') }}<span class="sr-only"> {{ t('a11y.opensNewTab') }}</span></a>
          <p class="mt-6 text-white/65">
            <a :href="`mailto:${contactEmail}`" class="hover:text-white">{{ contactEmail }}</a>
          </p>
        </div>
      </div>
      <p class="border-t border-white/15 py-6 text-xs text-white/55">{{ t('footer.copyright') }}</p>
    </UiContainer>
  </footer>
</template>
