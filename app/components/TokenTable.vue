<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      <button
        @click="$emit('toggle-actionable')"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="showActionableFirst
          ? 'bg-brand-600 text-white hover:bg-brand-700'
          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        {{ type === 'buy' ? 'Show buyable tokens first' : 'Show sellable tokens first' }}
      </button>
      <span v-if="loading" class="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-2">
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Fetching prices...
      </span>
    </div>

    <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-900 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <th class="px-4 py-3 font-semibold">#</th>
            <th class="px-4 py-3 font-semibold">Token</th>
            <th class="px-4 py-3 font-semibold text-right">Target Price</th>
            <th class="px-4 py-3 font-semibold text-right">Current Price</th>
            <th class="px-4 py-3 font-semibold text-right hidden sm:table-cell">Market Cap</th>
            <th class="px-4 py-3 font-semibold text-right">Diff from target</th>
            <th class="px-4 py-3 font-semibold text-center">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <template v-if="showActionableFirst && actionableAssets.length > 0">
            <tr
              v-for="(asset, idx) in actionableAssets"
              :key="'a-' + asset.symbol"
              :class="actionableRowClass"
            >
              <td class="px-4 py-3 text-gray-400">{{ idx + 1 }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ asset.name }}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500">{{ asset.symbol }}</div>
              </td>
              <td class="px-4 py-3 text-right font-mono">{{ formatPrice(asset.targetPrice) }}</td>
              <td class="px-4 py-3 text-right font-mono">
                {{ priceFor(asset) }}
              </td>
              <td class="px-4 py-3 text-right font-mono hidden sm:table-cell">
                {{ marketCapFor(asset) }}
              </td>
              <td class="px-4 py-3 text-right font-mono" :class="diffClass(asset)">
                {{ diffFor(asset) }}
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="statusBadgeClass(asset)">
                  {{ statusText(asset) }}
                </span>
              </td>
            </tr>
            <tr v-if="nonActionableAssets.length > 0">
              <td colspan="7" class="px-4 py-2 text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/50">
                Other tokens
              </td>
            </tr>
            <tr
              v-for="(asset, idx) in nonActionableAssets"
              :key="'n-' + asset.symbol"
              class="bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <td class="px-4 py-3 text-gray-400">{{ actionableAssets.length + idx + 1 }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ asset.name }}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500">{{ asset.symbol }}</div>
              </td>
              <td class="px-4 py-3 text-right font-mono">{{ formatPrice(asset.targetPrice) }}</td>
              <td class="px-4 py-3 text-right font-mono">{{ priceFor(asset) }}</td>
              <td class="px-4 py-3 text-right font-mono hidden sm:table-cell">{{ marketCapFor(asset) }}</td>
              <td class="px-4 py-3 text-right font-mono" :class="diffClass(asset)">{{ diffFor(asset) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="statusBadgeClass(asset)">
                  {{ statusText(asset) }}
                </span>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="(asset, idx) in sortedAssets"
              :key="asset.symbol"
              class="transition-colors"
              :class="isActionable(asset)
                ? actionableRowClass
                : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50'"
            >
              <td class="px-4 py-3 text-gray-400">{{ idx + 1 }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ asset.name }}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500">{{ asset.symbol }}</div>
              </td>
              <td class="px-4 py-3 text-right font-mono">{{ formatPrice(asset.targetPrice) }}</td>
              <td class="px-4 py-3 text-right font-mono">{{ priceFor(asset) }}</td>
              <td class="px-4 py-3 text-right font-mono hidden sm:table-cell">{{ marketCapFor(asset) }}</td>
              <td class="px-4 py-3 text-right font-mono" :class="diffClass(asset)">{{ diffFor(asset) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="statusBadgeClass(asset)">
                  {{ statusText(asset) }}
                </span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { formatPrice, formatMarketCap, formatPercentDiff } from '~/utils/formatPrice'
import { assetPriceKey } from '~/utils/priceCache'

export default {
  props: {
    assets: { type: Array, required: true },
    type: { type: String, required: true, validator: (v) => ['buy', 'sell'].includes(v) },
    prices: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    showActionableFirst: { type: Boolean, default: false },
  },
  emits: ['toggle-actionable'],
  computed: {
    sortedAssets() {
      return [...this.assets].sort((a, b) => {
        const capA = this.prices[assetPriceKey(a)]?.marketCap || 0
        const capB = this.prices[assetPriceKey(b)]?.marketCap || 0
        return capB - capA
      })
    },
    actionableAssets() {
      return this.sortedAssets.filter(a => this.isActionable(a))
    },
    nonActionableAssets() {
      return this.sortedAssets.filter(a => !this.isActionable(a))
    },
    actionableRowClass() {
      return this.type === 'buy'
        ? 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
        : 'bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50'
    },
  },
  methods: {
    formatPrice,
    formatMarketCap,
    priceDataFor(asset) {
      return this.prices[assetPriceKey(asset)]
    },
    isActionable(asset) {
      const priceData = this.priceDataFor(asset)
      if (!priceData || !priceData.price) return false

      if (this.type === 'buy') {
        return priceData.price <= asset.targetPrice
      }
      return priceData.price >= asset.targetPrice
    },
    priceFor(asset) {
      const priceData = this.priceDataFor(asset)
      return priceData ? formatPrice(priceData.price) : '—'
    },
    marketCapFor(asset) {
      const priceData = this.priceDataFor(asset)
      return priceData ? formatMarketCap(priceData.marketCap) : '—'
    },
    diffFor(asset) {
      const priceData = this.priceDataFor(asset)
      if (!priceData || !priceData.price) return '—'
      return formatPercentDiff(priceData.price, asset.targetPrice)
    },
    diffClass(asset) {
      const priceData = this.priceDataFor(asset)
      if (!priceData || !priceData.price) return ''

      const diff = priceData.price - asset.targetPrice
      if (this.type === 'buy') {
        return diff <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
      }
      return diff >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
    },
    statusText(asset) {
      if (!this.priceDataFor(asset)?.price) return 'Loading'
      if (this.isActionable(asset)) {
        return this.type === 'buy' ? 'Buy' : 'Sell'
      }
      return 'Wait'
    },
    statusBadgeClass(asset) {
      const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
      if (!this.priceDataFor(asset)?.price) {
        return base + ' bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
      }
      if (this.isActionable(asset)) {
        return this.type === 'buy'
          ? base + ' bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
          : base + ' bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
      }
      return base + ' bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
    },
  },
}
</script>
