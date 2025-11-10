'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

export default function PostHogTest() {
  const [status, setStatus] = useState<string>('Checking PostHog...')
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    // Check if PostHog is initialized
    const checkPostHog = () => {
      if (posthog.__loaded) {
        setStatus('✅ PostHog is initialized and ready!')

        // Check configuration
        const config = {
          api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY?.substring(0, 10) + '...',
          api_host: posthog.config.api_host,
          ui_host: posthog.config.ui_host,
          debug: posthog.config.debug,
        }

        console.log('[PostHog Test] Configuration:', config)
      } else {
        setStatus('⚠️ PostHog is not initialized')
      }
    }

    // Wait a bit for PostHog to initialize
    setTimeout(checkPostHog, 1000)
  }, [])

  const sendTestEvent = () => {
    const eventName = `test_event_${Date.now()}`
    posthog.capture(eventName, {
      test: true,
      timestamp: new Date().toISOString(),
      page: 'posthog-test',
      description: 'Manual test event from test page'
    })

    setEvents([...events, `Sent: ${eventName}`])
    console.log('[PostHog Test] Event sent:', eventName)
  }

  const identifyTestUser = () => {
    const userId = `test-user-${Date.now()}`
    posthog.identify(userId, {
      email: 'test@example.com',
      name: 'Test User',
      test_user: true
    })

    setEvents([...events, `Identified: ${userId}`])
    console.log('[PostHog Test] User identified:', userId)
  }

  const sendPageView = () => {
    posthog.capture('$pageview', {
      $current_url: window.location.href
    })

    setEvents([...events, 'Sent: $pageview'])
    console.log('[PostHog Test] Pageview sent')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            PostHog Connection Test
          </h1>

          <div className="mb-8">
            <div className="text-lg font-semibold mb-2">Status:</div>
            <div className="p-4 bg-blue-50 rounded-lg">
              {status}
            </div>
          </div>

          <div className="mb-8">
            <div className="text-lg font-semibold mb-2">Configuration:</div>
            <div className="p-4 bg-gray-50 rounded-lg text-sm font-mono">
              <div>API Key: {process.env.NEXT_PUBLIC_POSTHOG_KEY?.substring(0, 15)}...</div>
              <div>API Host: /ingest</div>
              <div>UI Host: https://us.posthog.com</div>
              <div>Debug Mode: {process.env.NODE_ENV === 'development' ? 'ON' : 'OFF'}</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Test Actions:</h2>

            <button
              onClick={sendTestEvent}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Send Test Event
            </button>

            <button
              onClick={identifyTestUser}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Identify Test User
            </button>

            <button
              onClick={sendPageView}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Send Pageview Event
            </button>
          </div>

          {events.length > 0 && (
            <div className="mb-8">
              <div className="text-lg font-semibold mb-2">Events Sent:</div>
              <div className="p-4 bg-green-50 rounded-lg">
                {events.map((event, index) => (
                  <div key={index} className="text-sm mb-1">
                    ✓ {event}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold mb-2">📋 How to verify:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open browser DevTools (F12)</li>
              <li>Go to Network tab and filter by "ingest"</li>
              <li>Click the test buttons above</li>
              <li>You should see POST requests to /ingest/batch</li>
              <li>Go to PostHog dashboard → Events to see the events (may take 1-2 min)</li>
              <li>Check Console tab for [PostHog Test] logs</li>
            </ol>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://us.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open PostHog Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
