/**
 * Barème du concours bêta-testeurs, copié du document « Yadony – Guide du
 * concours beta testeurs » (version du 5 octobre 2026). « Aider un autre
 * testeur » n'y figure pas : ce test n'est pas mesurable.
 */
export const BAREME = {
  outils: 80,
  paiement_mm: 100,
  paiement_carte: 100,
  paiement_especes: 100,
  scenario_complet: 100,
  trois_continents: 40,
  parrainage: 40,
  avis_parcours: 40,
  grille_kilos: 40,
  absence_expediteur: 100,
  absence_destinataire_procedure: 80,
  absence_voyageur: 100,
  annulation_voyageur: 100,
  annulation_expediteur: 100,
  code_retour: 80,
  retard_voyageur: 60,
  destinataire_absent: 60,
  litige: 60,
  appels: 40,
  message_destinataire: 20,
  message_app: 20,
  nego_trajet: 60,
  nego_colis: 60,
  filtres: 20,
} as const

export type TestKey = keyof typeof BAREME

export const TEST_KEYS = Object.keys(BAREME) as TestKey[]

/**
 * Points des retours envoyés avec le bouton scarabée (comptés une fois résolus)
 * et bonus du premier testeur à réussir chaque test du barème.
 */
export const POINTS = { bug: 20, suggestion: 30, avisEcran: 20, premier: 40 } as const

/** Tests affichés « n / 26 » : les tests à action, plus l'avis par écran et la suggestion. */
export const TOTAL_TESTS = TEST_KEYS.length + 2

/** Regroupement du barème sur la page, dans l'ordre du design validé. */
export const TEST_GROUPS: { id: string; tests: TestKey[] }[] = [
  { id: 'paiements', tests: ['paiement_mm', 'paiement_carte', 'paiement_especes'] },
  {
    id: 'absences',
    tests: [
      'absence_expediteur',
      'absence_voyageur',
      'annulation_voyageur',
      'annulation_expediteur',
      'absence_destinataire_procedure',
      'code_retour',
      'destinataire_absent',
      'retard_voyageur',
      'litige',
    ],
  },
  {
    id: 'parcours',
    tests: [
      'scenario_complet',
      'nego_trajet',
      'nego_colis',
      'trois_continents',
      'grille_kilos',
      'avis_parcours',
    ],
  },
  {
    id: 'outils',
    tests: ['outils', 'parrainage', 'appels', 'message_destinataire', 'message_app', 'filtres'],
  },
]
