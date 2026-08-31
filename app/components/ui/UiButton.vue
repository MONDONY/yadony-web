<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'orange' | 'light' | 'ghost-dark' | 'navy'
    size?: 'md' | 'lg'
    to?: string
    href?: string
  }>(),
  // `to` et `href` restent volontairement sans lien par défaut : leur absence
  // signale le rendu <button>, le cas par défaut du composant.
  { variant: 'primary', size: 'md', to: undefined, href: undefined },
)

const base =
  'inline-flex items-center justify-center gap-2 rounded-el font-semibold ' +
  'transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  ghost: 'border border-line text-ink hover:bg-sand',
  orange: 'bg-orange text-navy-deep hover:bg-orange-hover',
  light: 'bg-white text-navy hover:bg-sand',
  'ghost-dark': 'border border-white/30 text-white hover:bg-white/10',
  navy: 'bg-navy-deep text-white hover:bg-navy',
} as const

const sizes = { md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' } as const

const classes = [base, variants[props.variant], sizes[props.size]].join(' ')
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes"><slot /></NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="classes"
  ><slot /><span class="sr-only">{{ ` ${t('a11y.opensNewTab')}` }}</span></a>
  <button v-else type="button" :class="classes"><slot /></button>
</template>
