import type { ResearchStage } from '@/types';

/**
 * Project-level settings the research team edits by hand.
 * Nothing here is computed — change values as the study progresses.
 */
export const PROJECT = {
  name: 'Листик',
  year: 2026,
  /** Research tracker shown on the Home page */
  stages: {
    planning: 'done',
    collection: 'active',
    analysis: 'pending',
    results: 'pending',
  } satisfies Record<string, ResearchStage>,

  /**
   * The Results page stays in "Research in progress" until REAL (non-demo) data
   * reaches all of these thresholds. Demo data never unlocks Results.
   */
  resultsThreshold: {
    minMeasurements: 40,
    minSchools: 2,
    minWeeks: 3,
  },

  /**
   * Researcher's own interpretation, written by the team after analysis.
   * The site never generates conclusions on its own. Leave empty until ready.
   */
  researcherInterpretation: { ru: '', en: '' },

  /** Fill in when ready. Empty values render as "to be added". */
  team: {
    members: [] as string[],
    organization: '',
    contactEmail: '',
  },
};
