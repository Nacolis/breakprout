import { useState, useEffect } from 'react'
import { checkHealth, type HealthStatus } from '../lib/api'

export function useBackendHealth(intervalMs = 10_000) {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      const result = await checkHealth()
      if (!cancelled) {
        setHealth(result)
        setLoading(false)
      }
    }

    poll()
    const id = setInterval(poll, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  return { health, loading }
}
