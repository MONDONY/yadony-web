/**
 * Faits bruts d'un testeur, tels qu'écrits dans `app/data/classement.json`.
 * Aucun score n'est stocké : il est recalculé par `scoreTesteur` à partir du
 * barème, pour que le fichier reste une simple liste de constats vérifiables.
 */
export interface Testeur {
  /** 8 premiers caractères de l'UID Firebase (jamais l'UID complet : page publique). */
  id: string
  /** Prénom + initiale du nom (« Koro D. »), déjà formaté. */
  nom: string
  /** Clés de tests réussis (voir `TEST_KEYS`) ; doublons et clés inconnues ignorés. */
  tests: string[]
  /** Bugs résolus hors paiement. */
  bugs: number
  /** Suggestions résolues. */
  suggestions: number
  /** Écrans distincts ayant au moins un avis résolu. */
  ecransAvecAvis: number
  /** Activité affichée à titre indicatif, hors score. */
  indicatif: { ecrans: number; minutes: number }
  /** Heure du dernier point gagné (ISO), sert au départage des ex æquo. */
  dernierPoint: string | null
}

export interface ClassementData {
  miseAJour: string | null
  debut: string
  fin: string
  testeurs: Testeur[]
  /** Premier testeur à avoir réussi chaque test : `{ cleDeTest: idDuTesteur }` (badge « 1er »). */
  premiers?: Record<string, string>
}
