import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/*
 * A GitHub Pages project site serves from /<repo>/, not the domain root, so the
 * asset URLs, the manifest scope and start_url, and the service worker's
 * navigation fallback all need that prefix or the installed app 404s.
 * Root-served hosts (Cloudflare Pages, Netlify, a user.github.io site) need
 * nothing, so this defaults to '/'.
 *
 *   BASE_PATH=/daily-forge/ npm run build
 */
const base = `/${(process.env.BASE_PATH ?? '/').replace(/^\/|\/$/g, '')}/`.replace('//', '/')

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon.svg',
        'icons/apple-touch-icon.png',
        'icons/favicon-32.png',
      ],
      manifest: {
        name: 'Forge - Daily Growth Tracker',
        short_name: 'Forge',
        description: 'Eight pillars, one streak. Show up every day.',
        theme_color: '#08080a',
        background_color: '#08080a',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        categories: ['productivity', 'lifestyle', 'health'],
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: `${base}index.html`,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    host: true,
    port: 5178,
  },
})
