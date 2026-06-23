import { getAdapter } from '@/api'

export function useTelemetry() {
  function capture(event, data) {
    let adapter
    try { adapter = getAdapter() } catch { return }
    adapter.telemetry?.capture(event, data)
  }
  return { capture }
}
