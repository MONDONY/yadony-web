<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { contactEmail } from '@/lib/site'

defineI18nRoute({ paths: { fr: '/contact', en: '/contact' } })

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('contact.seo.title'),
    description: t('contact.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const name = ref('')
const email = ref('')
const message = ref('')
const submitted = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const errors = computed(() => ({
  name: name.value.trim() === '',
  email: !emailPattern.test(email.value.trim()),
  message: message.value.trim() === '',
}))

const isValid = computed(() => !errors.value.name && !errors.value.email && !errors.value.message)

const mailtoHref = computed(() => {
  const subject = `${t('contact.form.legend')} - ${name.value.trim()}`
  const body = `${message.value.trim()}\n\n${email.value.trim()}`
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})

function onSubmit() {
  submitted.value = true
  if (!isValid.value) return
  window.location.href = mailtoHref.value
}
</script>

<template>
  <div>
    <PageHero :title="t('contact.title')" :lead="t('contact.lead')" />
    <UiSection tone="white">
      <UiContainer>
        <div>
          <p class="text-sm text-ink-muted">{{ t('contact.emailLabel') }}</p>
          <a :href="`mailto:${contactEmail}`" class="mt-1 inline-block font-display text-lg font-semibold">{{ contactEmail }}</a>
        </div>

        <div class="mt-12 grid gap-10 sm:grid-cols-2">
          <div>
            <h2 class="text-display-md">{{ t('contact.support.title') }}</h2>
            <p class="mt-4 max-w-prose text-ink-muted">{{ t('contact.support.text') }}</p>
          </div>
          <div>
            <h2 class="text-display-md">{{ t('contact.press.title') }}</h2>
            <p class="mt-4 max-w-prose text-ink-muted">{{ t('contact.press.text') }}</p>
          </div>
        </div>
      </UiContainer>
    </UiSection>

    <UiSection tone="sand">
      <UiContainer>
        <form class="max-w-xl" novalidate @submit.prevent="onSubmit">
          <h2 class="text-display-md">{{ t('contact.form.legend') }}</h2>

          <div class="mt-8">
            <label for="contact-name" class="block text-sm font-medium text-ink">{{ t('contact.form.name') }}</label>
            <input
              id="contact-name"
              v-model="name"
              type="text"
              class="mt-2 w-full rounded-el border bg-surface px-4 py-2.5"
              :class="submitted && errors.name ? 'border-ink' : 'border-line'"
              :aria-invalid="submitted && errors.name"
              :aria-describedby="submitted && errors.name ? 'contact-name-error' : undefined"
            >
            <p v-if="submitted && errors.name" id="contact-name-error" role="alert" class="mt-1.5 text-sm font-medium text-ink">
              {{ t('contact.form.errors.name') }}
            </p>
          </div>

          <div class="mt-6">
            <label for="contact-email" class="block text-sm font-medium text-ink">{{ t('contact.form.email') }}</label>
            <input
              id="contact-email"
              v-model="email"
              type="email"
              class="mt-2 w-full rounded-el border bg-surface px-4 py-2.5"
              :class="submitted && errors.email ? 'border-ink' : 'border-line'"
              :aria-invalid="submitted && errors.email"
              :aria-describedby="submitted && errors.email ? 'contact-email-error' : undefined"
            >
            <p v-if="submitted && errors.email" id="contact-email-error" role="alert" class="mt-1.5 text-sm font-medium text-ink">
              {{ t('contact.form.errors.email') }}
            </p>
          </div>

          <div class="mt-6">
            <label for="contact-message" class="block text-sm font-medium text-ink">{{ t('contact.form.message') }}</label>
            <textarea
              id="contact-message"
              v-model="message"
              rows="5"
              class="mt-2 w-full rounded-el border bg-surface px-4 py-2.5"
              :class="submitted && errors.message ? 'border-ink' : 'border-line'"
              :aria-invalid="submitted && errors.message"
              :aria-describedby="submitted && errors.message ? 'contact-message-error' : undefined"
            />
            <p v-if="submitted && errors.message" id="contact-message-error" role="alert" class="mt-1.5 text-sm font-medium text-ink">
              {{ t('contact.form.errors.message') }}
            </p>
          </div>

          <button
            type="submit"
            class="mt-8 inline-flex items-center justify-center gap-2 rounded-el bg-primary px-7 py-3.5 text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >{{ t('contact.form.submit') }}</button>

          <p class="mt-4 text-sm text-ink-muted">{{ t('contact.form.note') }}</p>
        </form>
      </UiContainer>
    </UiSection>
  </div>
</template>
