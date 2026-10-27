import type { TimelineStep } from '@/data/types'

/** The first two steps that aren't done, in date order: the current one and the one after it. */
export function nextSteps(steps: TimelineStep[]): TimelineStep[] {
  return [...steps]
    .filter((step) => step.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 2)
}
