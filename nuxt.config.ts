export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  ssr: false,

  nitro: {
    preset: 'netlify',
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
  ],

  runtimeConfig: {
    public: {
      cacheMaxAgeSeconds: 600,
      lists: {
        buy: [
          'defi-report-2026-buy-targets',
          //'mock-buy-targets',
        ],
        sell: [
          //'mock-sell-targets-1',
          //'mock-sell-targets-2',
        ],
      },
    },
  },

  colorMode: {
    preference: 'dark',
    classSuffix: '',
  },

  app: {
    head: {
      title: 'Crypto Price Targets',
      meta: [
        { name: 'description', content: 'Track crypto token buy and sell price targets' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>' },
      ],
    },
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.nuxt/**'],
      },
    },
  },
})
