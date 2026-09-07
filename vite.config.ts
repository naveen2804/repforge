import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Project pages live at https://<user>.github.io/repforge/ — override with BASE_PATH if
// you ever move the app to a custom domain or a user/org page.
const base = process.env.BASE_PATH ?? '/repforge/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'RepForge — Workout Tracker',
        short_name: 'RepForge',
        description: 'Plan, log and track your gym workouts.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f7f7f8',
        theme_color: '#f7f7f8',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app shell + the exercise catalogue are precached. Exercise photos are
        // ~18 MB in total, so they are cached lazily as you actually look at them.
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'exercises.json'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/^\/ex\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/ex/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'repforge-exercise-images',
              expiration: { maxEntries: 900, maxAgeSeconds: 60 * 60 * 24 * 180 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
