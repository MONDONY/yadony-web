import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: { fr: { chips: ['Billets', 'Kilos'], steps: [{ title: 'Un', text: 'Texte', tags: ['a', 'b'] }] } },
})

function run() {
  let texts!: ReturnType<typeof useTexts>
  mount(defineComponent({ setup() { texts = useTexts(); return () => h('div') } }), { global: { plugins: [i18n] } })
  return texts
}

describe('useTexts', () => {
  it('résout une liste de chaînes', () => {
    expect(run().list('chips')).toEqual(['Billets', 'Kilos'])
  })

  it('résout une liste d’objets, y compris leurs tableaux', () => {
    expect(run().items('steps')).toEqual([{ title: 'Un', text: 'Texte', tags: ['a', 'b'] }])
  })
})
