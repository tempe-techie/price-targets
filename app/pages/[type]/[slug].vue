<template>
  <div>
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to all lists
    </NuxtLink>

    <div v-if="loadError" class="text-center py-20">
      <p class="text-lg text-red-500">{{ loadError }}</p>
      <NuxtLink to="/" class="mt-4 inline-block text-brand-500 hover:text-brand-400">Go home</NuxtLink>
    </div>

    <div v-else-if="listLoading" class="text-center py-20">
      <svg class="animate-spin w-8 h-8 mx-auto text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="list">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <span
            class="flex items-center justify-center w-10 h-10 rounded-xl text-xl font-bold"
            :class="type === 'buy'
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'"
          >
            {{ type === 'buy' ? '↓' : '↑' }}
          </span>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold">{{ list.name }}</h1>
            <span
              class="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider"
              :class="type === 'buy'
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'"
            >
              {{ type }} targets
            </span>
          </div>
        </div>
        <p v-if="list.description" class="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
          {{ list.description }}
        </p>
        <div v-if="list.urls" class="flex flex-wrap gap-3 mt-3">
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
        </div>
      </div>

      <TokenTable
        :assets="list.assets"
        :type="type"
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

export default {
  data() {
    return {
      list: null,
      listLoading: true,
      loadError: '',
      prices: {},
      pricesLoading: false,
      showActionableFirst: false,
      type: '',
      slug: '',
    }
  },
  async mounted() {
    const route = useRoute()
    this.type = route.params.type
    this.slug = route.params.slug

    if (!['buy', 'sell'].includes(this.type)) {
      this.loadError = 'Invalid list type'
      this.listLoading = false
      return
    }

    try {
      this.list = await $fetch(`/data/price-targets/${this.type}/${this.slug}.json`)
    } catch {
      this.loadError = 'List not found'
    } finally {
      this.listLoading = false
    }

    if (this.list?.assets?.length) {
      this.loadPrices()
    }
  },
  methods: {
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
