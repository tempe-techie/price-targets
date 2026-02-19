<template>
  <div>
    <div v-if="listLoading" class="text-center py-20">
      <svg class="animate-spin w-8 h-8 mx-auto text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="loadError" class="text-center py-20">
      <p class="text-lg text-red-500">{{ loadError }}</p>
    </div>

    <div v-else-if="list">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <span class="flex items-center justify-center w-10 h-10 rounded-xl text-xl font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
            ↓
          </span>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold">{{ list.name }}</h1>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
              buy targets
            </span>
          </div>
        </div>
        <p v-if="list.description" class="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
          {{ list.description }}
        </p>
        <div class="flex flex-wrap items-center gap-3 mt-3">
          <a
            v-for="(url, key) in list.urls"
            :key="key"
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-400 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {{ key }}
          </a>
          <button
            v-if="isInMiniApp"
            @click="shareCast"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 transition-colors"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
            Share on Farcaster
          </button>
        </div>
      </div>

      <TokenTable
        :assets="list.assets"
        type="buy"
        :prices="prices"
        :loading="pricesLoading"
        :show-actionable-first="showActionableFirst"
        @toggle-actionable="showActionableFirst = !showActionableFirst"
      />
    </div>
  </div>
</template>

<script>
import { fetchPrices } from '~/utils/priceCache'

const LIST_PATH = '/data/price-targets/buy/defi-report-2026-buy-targets.json'

export default {
  data() {
    return {
      list: null,
      listLoading: true,
      loadError: '',
      prices: {},
      pricesLoading: false,
      showActionableFirst: false,
      isInMiniApp: false,
    }
  },
  async mounted() {
    const { $isInMiniApp } = useNuxtApp()
    this.isInMiniApp = !!$isInMiniApp

    try {
      this.list = await $fetch(LIST_PATH)
    } catch {
      this.loadError = 'Failed to load price targets'
    } finally {
      this.listLoading = false
    }

    if (this.list?.assets?.length) {
      this.loadPrices()
    }
  },
  methods: {
    async shareCast() {
      const { $farcasterSDK } = useNuxtApp()
      if (!$farcasterSDK) return

      const symbols = this.list.assets.map(a => a.symbol).slice(0, 8).join(', ')
      const text = `Check out this buy targets list: ${this.list.name}\n\nTokens: ${symbols}${this.list.assets.length > 8 ? ` (+${this.list.assets.length - 8} more)` : ''}`

      try {
        await $farcasterSDK.actions.composeCast({ text })
      } catch (err) {
        console.error('Failed to compose cast:', err)
      }
    },
    async loadPrices() {
      this.pricesLoading = true
      try {
        const config = useRuntimeConfig()
        const maxAge = config.public.cacheMaxAgeSeconds || 3600
        this.prices = await fetchPrices(this.list.assets, maxAge)
      } catch (err) {
        console.error('Failed to load prices:', err)
      } finally {
        this.pricesLoading = false
      }
    },
  },
}
</script>
