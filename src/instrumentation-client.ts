// src/instrumentation-client.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: '/ingest', // Use the reverse proxy
    ui_host: 'https://us.posthog.com',
    person_profiles: 'always',
    defaults: '2025-11-30',
    loaded: (posthog) => {
      //if (process.env.NODE_ENV === 'development')
         posthog.debug()
    }
  });
}