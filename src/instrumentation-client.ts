// instrumentation-client.ts
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest', // Use your reverse proxy
  ui_host: 'https://us.posthog.com',
  defaults: '2025-11-30',
  loaded: (posthog) => {
    if (process.env.NODE_ENV === 'development') posthog.debug()
  }
});