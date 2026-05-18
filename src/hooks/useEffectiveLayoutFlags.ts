import { useEffect, useMemo, useState } from 'react'
import {
  resolveEffectiveLayoutFlags,
  type EffectiveLayoutFlags,
} from '../config/layoutFeatureFlags'

const LG_MAX_WIDTH_PX = 1023

/**
 * Env-based layout flags + viewport hint for `forceMobileStack`.
 * UI-only; does not touch trading store or adapters.
 */
export function useEffectiveLayoutFlags(): EffectiveLayoutFlags {
  const [viewportIsMobile, setViewportIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${LG_MAX_WIDTH_PX}px)`).matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LG_MAX_WIDTH_PX}px)`)
    const onChange = () => setViewportIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return useMemo(
    () => resolveEffectiveLayoutFlags({ viewportIsMobile }),
    [viewportIsMobile],
  )
}
