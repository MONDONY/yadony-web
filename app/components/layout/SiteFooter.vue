<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { betaTesting, betaWhatsAppGroupUrl, contactEmail } from '@/lib/site'
import { socialLinks, whatsappIconPath } from '@/lib/social'

const { t } = useI18n()
const p = useLocalePath()
const { reopen } = useCookieConsent()

const YADONY_PRO_URL = 'https://pro.yadony.com'
</script>

<template>
  <footer class="bg-navy-deep text-white">
    <UiContainer>
      <!-- Bloc bêta : le bandeau du header porte déjà le lien, ce bloc porte le
           QR code. Un QR n'a pas sa place dans une bande collante de 36 px (il y
           serait illisible) et ne sert à rien sur mobile, où l'on ne scanne pas
           son propre écran : il est donc réservé aux écrans larges, l'invitation
           restant cliquable partout. -->
      <div
        v-if="betaTesting"
        class="flex flex-col gap-6 border-b border-white/15 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
      >
        <div>
          <p class="font-display text-lg font-semibold text-white">{{ t('beta.footer.title') }}</p>
          <p class="mt-2 max-w-prose text-sm text-white/65">{{ t('beta.footer.text') }}</p>
          <a
            :href="betaWhatsAppGroupUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex items-center gap-2 font-semibold text-orange transition-[color,transform] duration-150 hover:text-orange-hover active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="currentColor" aria-hidden="true">
              <path :d="whatsappIconPath" />
            </svg>
            {{ t('beta.banner.cta') }}<span class="sr-only"> {{ t('a11y.opensNewTab') }}</span>
          </a>
        </div>

        <!-- Rayons concentriques : extérieur 18px = intérieur 10px + padding 8px. -->
        <figure class="hidden shrink-0 text-center sm:block">
          <img
            src="/beta/qr-groupe-whatsapp.webp"
            :alt="t('beta.footer.qrAlt')"
            width="580"
            height="580"
            loading="lazy"
            decoding="async"
            class="h-[124px] w-[124px] rounded-[18px] bg-white p-2"
          >
          <figcaption class="mt-2 text-xs text-white/55">{{ t('beta.footer.scan') }}</figcaption>
        </figure>
      </div>

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
          <ul class="mt-6 flex list-none gap-2" :aria-label="t('footer.socialLabel')">
            <li v-for="social in socialLinks" :key="social.name">
              <a
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex h-10 w-10 items-center justify-center rounded-el text-white/65 transition-[color,background-color] duration-150 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path :d="social.iconPath" />
                </svg>
                <span class="sr-only">{{ social.name }} ({{ t('a11y.opensNewTab') }})</span>
              </a>
            </li>
          </ul>
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
