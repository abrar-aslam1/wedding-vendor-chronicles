"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use Vite environment variables (VITE_ prefix) with fallback to Next.js (NEXT_PUBLIC_ prefix)
      const posthogKey = import.meta.env?.VITE_POSTHOG_KEY || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_POSTHOG_KEY : undefined)
      const posthogHost = import.meta.env?.VITE_POSTHOG_HOST || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_POSTHOG_HOST : undefined)

      if (!posthogKey) {
        console.error('[PostHog] No API key found. Please set VITE_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_KEY')
        console.error('[PostHog] Available env vars:', {
          viteKey: import.meta.env?.VITE_POSTHOG_KEY ? 'present' : 'missing',
          nextKey: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'present' : 'missing'
        })
        return
      }

      console.log('[PostHog] Initializing with key:', posthogKey.substring(0, 10) + '...')
      console.log('[PostHog] Host:', posthogHost)

      posthog.init(posthogKey, {
        api_host: posthogHost || "https://us.i.posthog.com",
        ui_host: "https://us.posthog.com",
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        capture_exceptions: true,
        debug: true, // Always enable debug to see what's happening
        loaded: (posthog) => {
          console.log('[PostHog] Initialized successfully!')
          console.log('[PostHog] Capturing test event...')
          posthog.capture('posthog_initialized', {
            timestamp: new Date().toISOString(),
            environment: import.meta.env?.MODE || (typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown')
          })
        }
      })
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}