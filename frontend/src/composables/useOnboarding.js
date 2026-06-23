import { computed } from 'vue'
import { getAdapter } from '@/api'

export function useOnboarding(_app) {
  function updateOnboardingStep(step) {
    let adapter
    try { adapter = getAdapter() } catch { return }
    adapter.onboarding?.complete(step)
  }

  // For non-Frappe adapters: report completed so onboarding UI never appears.
  const isOnboardingStepsCompleted = computed(() => true)
  function setUp() {}

  return { updateOnboardingStep, isOnboardingStepsCompleted, setUp }
}
