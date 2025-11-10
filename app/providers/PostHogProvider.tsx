"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Support both Vite (VITE_) and Next.js (NEXT_PUBLIC_) env var prefixes
      const posthogKey = import.meta.env?.VITE_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
      const posthogHost = import.meta.env?.VITE_POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST

      if (!posthogKey) {
        console.error('[PostHog] No API key found. Please set VITE_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_KEY')
        return
      }

      console.log('[PostHog] Initializing with key:', posthogKey?.substring(0, 10) + '...')

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
            environment: import.meta.env?.MODE || process.env.NODE_ENV
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