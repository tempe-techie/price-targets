<template>
  <div>
    <div class="mb-10">
      <h1 class="text-3xl sm:text-4xl font-bold mb-2">
        Price Targets
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-lg">
        Track crypto token buy and sell price targets across curated lists.
      </p>
    </div>

    <section class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-lg font-bold">
          ↓
        </span>
        <h2 class="text-2xl font-semibold">Buy Targets</h2>
      </div>
      <div v-if="loading" class="text-gray-400 dark:text-gray-500 italic pl-11">Loading...</div>
      <div v-else-if="buyLists.length === 0" class="text-gray-400 dark:text-gray-500 italic pl-11">
        No lists yet
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="list in buyLists"
          :key="list.slug"
          :to="`/buy/${list.slug}`"
          class="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
        >
          <h3 class="text-lg font-semibold mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {{ list.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {{ list.description }}
          </p>
          <div class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16" />
            </svg>
            {{ list.assetCount }} tokens
          </div>
        </NuxtLink>
      </div>
    </section>

    <section>
      <div class="flex items-center gap-3 mb-6">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-lg font-bold">
          ↑
        </span>
        <h2 class="text-2xl font-semibold">Sell Targets</h2>
      </div>
      <div v-if="loading" class="text-gray-400 dark:text-gray-500 italic pl-11">Loading...</div>
      <div v-else-if="sellLists.length === 0" class="text-gray-400 dark:text-gray-500 italic pl-11">
        No lists yet
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="list in sellLists"
          :key="list.slug"
          :to="`/sell/${list.slug}`"
          class="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-lg hover:shadow-rose-500/5 transition-all"
        >
          <h3 class="text-lg font-semibold mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {{ list.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {{ list.description }}
          </p>
          <div class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16" />
            </svg>
            {{ list.assetCount }} tokens
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      buyLists: [],
      sellLists: [],
      loading: true,
    }
  },
  async mounted() {
    const config = useRuntimeConfig()
    const lists = config.public.lists

    try {
      const [buyResults, sellResults] = await Promise.all([
        this.loadLists(lists.buy || [], 'buy'),
        this.loadLists(lists.sell || [], 'sell'),
      ])
      this.buyLists = buyResults
      this.sellLists = sellResults
    } catch (err) {
      console.error('Failed to load lists:', err)
    } finally {
      this.loading = false
    }
  },
  methods: {
    async loadLists(slugs, type) {
      const results = await Promise.all(
        slugs.map(async (slug) => {
          try {
            const data = await $fetch(`/data/price-targets/${type}/${slug}.json`)
            return {
              slug,
              name: data.name || slug,
              description: data.description || '',
              assetCount: data.assets?.length || 0,
            }
          } catch {
            return null
          }
        })
      )
      return results.filter(Boolean)
    },
  },
}
</script>
