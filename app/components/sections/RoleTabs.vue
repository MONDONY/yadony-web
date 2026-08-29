<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { roles, type Role } from '@/lib/roles'

const props = defineProps<{ modelValue: Role }>()
const emit = defineEmits<{ 'update:modelValue': [Role] }>()

const { t } = useI18n()

function select(role: Role) {
  if (role !== props.modelValue) emit('update:modelValue', role)
}
</script>

<template>
  <div role="tablist" :aria-label="t('howItWorks.tabsLabel')" class="inline-flex rounded-el border border-line p-1">
    <button
      v-for="role in roles"
      :id="`onglet-${role}`"
      :key="role"
      type="button"
      role="tab"
      :aria-selected="role === modelValue"
      :aria-controls="`panneau-${role}`"
      class="rounded-[9px] px-5 py-2 text-sm font-semibold transition-colors duration-150"
      :class="role === modelValue ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'"
      @click="select(role)"
    >{{ t(`howItWorks.${role}.tab`) }}</button>
  </div>
</template>
