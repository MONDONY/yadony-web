<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { roles, type Role } from '@/lib/roles'

const props = defineProps<{ modelValue: Role }>()
const emit = defineEmits<{ 'update:modelValue': [Role] }>()

const { t } = useI18n()

const tabRefs: (HTMLButtonElement | null)[] = []

function setTabRef(el: Element | null, index: number) {
  tabRefs[index] = el as HTMLButtonElement | null
}

function select(role: Role) {
  if (role !== props.modelValue) emit('update:modelValue', role)
}

function activateByIndex(index: number) {
  const role = roles[index]
  if (!role) return
  select(role)
  tabRefs[index]?.focus()
}

function onKeydown(event: KeyboardEvent, index: number) {
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      activateByIndex((index + 1) % roles.length)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      activateByIndex((index - 1 + roles.length) % roles.length)
      break
    case 'Home':
      event.preventDefault()
      activateByIndex(0)
      break
    case 'End':
      event.preventDefault()
      activateByIndex(roles.length - 1)
      break
  }
}
</script>

<template>
  <div role="tablist" :aria-label="t('howItWorks.tabsLabel')" class="inline-flex rounded-el border border-line p-1">
    <button
      v-for="(role, index) in roles"
      :id="`onglet-${role}`"
      :key="role"
      :ref="(el) => setTabRef(el as Element | null, index)"
      type="button"
      role="tab"
      :tabindex="role === modelValue ? 0 : -1"
      :aria-selected="role === modelValue"
      :aria-controls="`panneau-${role}`"
      class="rounded-[9px] px-5 py-2 text-sm font-semibold transition-colors duration-150"
      :class="role === modelValue ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'"
      @click="select(role)"
      @keydown="onKeydown($event, index)"
    >{{ t(`howItWorks.${role}.tab`) }}</button>
  </div>
</template>
