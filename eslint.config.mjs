// @ts-check
import withNuxt from './node_modules/.cache/nuxt/.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['tests/**/*.ts'],
    rules: {
      // Les tests castent le JSON-LD renvoyé (object) pour vérifier des
      // champs profondément imbriqués sans dupliquer les types de retour.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
