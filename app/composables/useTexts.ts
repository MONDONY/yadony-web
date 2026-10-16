import { useI18n } from 'vue-i18n'

type Raw = Record<string, unknown>

// Un message compilé par vue-i18n est un objet AST (clés `type`, `loc`) : il
// se résout avec rt(). Les autres objets sont des groupes de clés à parcourir.
// Aucune clé de contenu ne doit donc s'appeler `type` ni `loc`.

// Lecture des listes de traduction (tableaux de chaînes ou d'objets) en
// valeurs déjà résolues, pour les `v-for` des sections.
export function useTexts() {
  const { tm, rt } = useI18n()

  function resolve(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(resolve)
    if (value && typeof value === 'object' && !('type' in (value as Raw) || 'loc' in (value as Raw))) {
      return Object.fromEntries(Object.entries(value as Raw).map(([key, child]) => [key, resolve(child)]))
    }
    return rt(value as never)
  }

  function list(key: string): string[] {
    return (tm(key) as unknown[]).map(item => rt(item as never))
  }

  function items<T extends Record<string, unknown>>(key: string): T[] {
    return (tm(key) as unknown[]).map(item => resolve(item) as T)
  }

  return { list, items }
}
