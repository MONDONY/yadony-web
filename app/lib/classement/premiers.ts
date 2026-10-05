import { BAREME, type TestKey } from './bareme'
import type { Testeur } from './types'

/**
 * Premier testeur à avoir réussi chaque test (badge « 1er », sans effet sur
 * les points). Le JSON donne `{ cleDeTest: idDuTesteur }`, établi à partir
 * des heures enregistrées ; tout ce qui ne correspond pas à un test validé
 * par ce testeur est ignoré.
 */
export type Premiers = Partial<Record<TestKey, { id: string; nom: string }>>

export function normaliserPremiers(
  brut: Record<string, string> | undefined,
  testeurs: Testeur[],
): Premiers {
  const parId = new Map(testeurs.map(t => [t.id, t]))
  const resultat: Premiers = {}
  for (const [cle, id] of Object.entries(brut ?? {})) {
    if (!Object.prototype.hasOwnProperty.call(BAREME, cle)) continue
    const t = parId.get(id)
    if (!t || !t.tests.includes(cle)) continue
    resultat[cle as TestKey] = { id: t.id, nom: t.nom }
  }
  return resultat
}

export function premiersDe(id: string, premiers: Premiers): TestKey[] {
  return (Object.keys(premiers) as TestKey[]).filter(cle => premiers[cle]?.id === id)
}
