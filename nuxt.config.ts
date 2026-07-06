const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://price-targets-22.vercel.app'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  ssr: false,

  nitro: {
    preset: process.env.NITRO_PRESET || (process.env.NETLIFY ? 'netlify' : 'vercel'),
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
  ],

  runtimeConfig: {
    public: {
      siteUrl,
      cacheMaxAgeSeconds: 600,
      lists: {
        buy: [
          'defi-report-2026-buy-targets',
          'btc-miners',
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
        { property: 'og:title', content: 'Crypto Price Targets' },
        { property: 'og:description', content: 'Track crypto token buy and sell price targets' },
        { property: 'og:image', content: `${siteUrl}/img/cover.jpg` },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Crypto Price Targets' },
        { name: 'twitter:description', content: 'Track crypto token buy and sell price targets' },
        { name: 'twitter:image', content: `${siteUrl}/img/cover.jpg` },
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
